"use client";

import { useState, useCallback, useEffect } from "react";
import { createEmployee, updateEmployee } from "@/app/actions";
import { Button } from "@/components/ui/button";
import Cropper from "react-easy-crop";
import { X, Upload } from "lucide-react";
import * as Icons from "lucide-react";

// ... (keep existing getCroppedImg function - lines 8-51)

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL("image/jpeg", 0.9);
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}

interface Employee {
  id: string;
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  instagram: string;
  linkedin: string;
  googleReviews: string;
  photoUrl: string | null;
  slug: string;
  companyId: string;
  isAdmin: boolean;
  customFieldValues: Array<{ customFieldId: string; value: string }>;
}

export default function EmployeeForm({
  companyId,
  initialData,
  onCancel,
  customFields = [],
  fieldVisibility,
  customFieldValues = []
}: {
  companyId: string;
  initialData?: Employee;
  onCancel?: () => void;
  customFields?: Array<{ id: string; label: string; icon: string; placeholder: string | null }>;
  fieldVisibility?: any;
  customFieldValues?: Array<{ customFieldId: string; value: string }>;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(initialData?.photoUrl || null);
  const [isCropping, setIsCropping] = useState(false);
  const [isAdmin, setIsAdmin] = useState(initialData?.isAdmin || false);
  const [alsoPhoneCalls, setAlsoPhoneCalls] = useState(initialData?.phone ? true : false);
  const [error, setError] = useState<string | null>(null);


  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setIsCropping(true);
    }
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result as string), false);
      reader.readAsDataURL(file);
    });
  };

  const showCroppedImage = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(croppedImage);
      setIsCropping(false);
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels]);

  const visibility = fieldVisibility || {
    showWhatsapp: true,
    showEmail: true,
    showPhone: true,
    showWebsite: true,
    showInstagram: true,
    showLinkedin: true,
    showGoogleReviews: false
  };

  return (
    <form
      action={async (formData) => {
        setError(null);
        if (croppedImage) {
          formData.append("photoUrl", croppedImage);
        }
        formData.append("isAdmin", isAdmin.toString()); // Append isAdmin value

        let result;
        if (initialData) {
          formData.append("id", initialData.id);
          formData.append("companyId", companyId);
          await updateEmployee(formData);
          onCancel?.();
        } else {
          result = await createEmployee(formData);
          if (result?.error) {
            setError(result.error);
          }
        }
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="companyId" value={companyId} />

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Photo Upload */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500">Foto de Perfil</label>
        {croppedImage ? (
          <div className="relative w-24 h-24 mx-auto">
            <img src={croppedImage} alt="Profile" className="w-full h-full rounded-full object-cover border-2" />
            <button
              type="button"
              onClick={() => setCroppedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900">
            <Upload size={24} className="text-gray-400" />
            <span className="text-xs text-gray-500 mt-1">Subir Foto</span>
            <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
          </label>
        )}
      </div>

      {/* Cropping Modal */}
      {isCropping && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-md overflow-hidden relative flex flex-col h-[500px]">
            <div className="p-4 border-b dark:border-zinc-800 flex justify-between items-center z-10 bg-white dark:bg-zinc-900">
              <h3 className="font-semibold">Recortar Imagen</h3>
              <button type="button" onClick={() => setIsCropping(false)} className="text-gray-500 hover:text-black dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="relative flex-1 bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
              />
            </div>
            <div className="p-4 bg-white dark:bg-zinc-900 border-t dark:border-zinc-800">
              <Button type="button" onClick={showCroppedImage} className="w-full">
                Recortar y Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Name & Job Title */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">Nombre Completo</label>
        <input name="name" defaultValue={initialData?.name} placeholder="Juan Pérez" className="w-full border p-2 rounded bg-gray-50 dark:bg-black text-base" required />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">Cargo / Título</label>
        <input name="jobTitle" defaultValue={initialData?.jobTitle} placeholder="Gerente de Ventas" className="w-full border p-2 rounded bg-gray-50 dark:bg-black text-base" />
      </div>

      {/* isAdmin Checkbox */}
      <div className="flex items-center space-x-2 mt-2">
        <input
          type="checkbox"
          id="isAdmin"
          name="isAdminCheckbox" // Use a different name for the checkbox if you want to handle it separately
          checked={isAdmin}
          onChange={(e) => setIsAdmin(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Es Administrador
        </label>
        {/* Hidden input to ensure 'isAdmin' is always submitted, even if unchecked */}
        <input type="hidden" name="isAdmin" value={isAdmin.toString()} />
      </div>

      {/* Default Fields - Conditional Rendering */}
      <div className="space-y-3">
        {visibility.showEmail && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Correo Electrónico</label>
            <input type="email" name="email" defaultValue={initialData?.email} placeholder="ejemplo@correo.com" className="w-full border p-2 rounded bg-gray-50 dark:bg-black text-base" />
          </div>
        )}

        {visibility.showWhatsapp && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">WhatsApp</label>
            <input type="tel" name="whatsapp" defaultValue={initialData?.whatsapp} placeholder="+56 9 1234 5678" className="w-full border p-2 rounded bg-gray-50 dark:bg-black text-base" />
            <div className="flex items-center space-x-2 mt-1">
              <input
                type="checkbox"
                id="alsoPhoneCalls"
                checked={alsoPhoneCalls}
                onChange={(e) => setAlsoPhoneCalls(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="alsoPhoneCalls" className="text-xs text-gray-600 dark:text-gray-400">
                También llamadas telefónicas
              </label>
            </div>
            {/* Hidden field to store phone = whatsapp if checkbox checked */}
            <input type="hidden" name="phone" value={alsoPhoneCalls ? (initialData?.whatsapp || "") : ""} />
          </div>
        )}

        {visibility.showWebsite && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Sitio Web</label>
            <input type="url" name="website" defaultValue={initialData?.website} placeholder="www.ejemplo.com" className="w-full border p-2 rounded bg-gray-50 dark:bg-black text-base" />
          </div>
        )}

        {visibility.showInstagram && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Instagram</label>
            <input name="instagram" defaultValue={initialData?.instagram} placeholder="@tu_usuario" className="w-full border p-2 rounded bg-gray-50 dark:bg-black text-base" />
          </div>
        )}

        {visibility.showLinkedin && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">LinkedIn</label>
            <input type="url" name="linkedin" defaultValue={initialData?.linkedin} placeholder="linkedin.com/in/tu-perfil" className="w-full border p-2 rounded bg-gray-50 dark:bg-black text-base" />
          </div>
        )}

        {visibility.showGoogleReviews && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Reseñas de Google</label>
            <input name="googleReviews" defaultValue={initialData?.googleReviews} placeholder="URL de Google Reviews" className="w-full border p-2 rounded bg-gray-50 dark:bg-black" />
          </div>
        )}
      </div>

      {/* Custom Fields */}
      {customFields.map((field) => {
        const existingValue = customFieldValues.find(v => v.customFieldId === field.id)?.value || "";
        const FieldIcon = (Icons as any)[field.icon] || Icons.Link;
        return (
          <div key={field.id} className="space-y-1">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <FieldIcon size={14} />
              {field.label}
            </label>
            <input
              name={`customField_${field.id}`}
              defaultValue={existingValue}
              placeholder={field.placeholder || field.label}
              className="w-full border p-2 rounded bg-gray-50 dark:bg-black"
            />
          </div>
        );
      })}

      {/* Submit Buttons */}
      <div className="flex gap-2 mt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button type="submit" className="flex-1">
          {initialData ? "Actualizar" : "Agregar"} Empleado
        </Button>
      </div>
    </form>
  );
}
