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

export default function EmployeeForm({
  companyId,
  initialData,
  onCancel,
  customFields = [],
  fieldVisibility,
  customFieldValues = []
}: {
  companyId: string;
  initialData?: any;
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
        if (croppedImage) {
          formData.append("photoUrl", croppedImage);
        }
        if (initialData) {
          formData.append("id", initialData.id);
          formData.append("companyId", companyId);
          await updateEmployee(formData);
          onCancel?.();
        } else {
          await createEmployee(formData);
        }
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="companyId" value={companyId} />

      {/* Photo Upload */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500">Profile Photo</label>
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
            <span className="text-xs text-gray-500 mt-1">Upload Photo</span>
            <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
          </label>
        )}
      </div>

      {/* Cropping Modal */}
      {isCropping && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-md overflow-hidden relative flex flex-col h-[500px]">
            <div className="p-4 border-b dark:border-zinc-800 flex justify-between items-center z-10 bg-white dark:bg-zinc-900">
              <h3 className="font-semibold">Crop Image</h3>
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
                Crop & Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Name & Job Title */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">Full Name</label>
        <input name="name" defaultValue={initialData?.name} placeholder="John Doe" className="w-full border p-2 rounded bg-gray-50 dark:bg-black" required />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">Job Title</label>
        <input name="jobTitle" defaultValue={initialData?.jobTitle} placeholder="Sales Manager" className="w-full border p-2 rounded bg-gray-50 dark:bg-black" />
      </div>

      {/* Default Fields - Conditional Rendering */}
      <div className="grid grid-cols-2 gap-2">
        {visibility.showEmail && <input name="email" defaultValue={initialData?.email} placeholder="Email" className="border p-2 rounded bg-gray-50 dark:bg-black" />}
        {visibility.showPhone && <input name="phone" defaultValue={initialData?.phone} placeholder="Phone" className="border p-2 rounded bg-gray-50 dark:bg-black" />}
      </div>

      {visibility.showWhatsapp && <input name="whatsapp" defaultValue={initialData?.whatsapp} placeholder="WhatsApp (e.g. +569...)" className="border p-2 rounded bg-gray-50 dark:bg-black" />}
      {visibility.showWebsite && <input name="website" defaultValue={initialData?.website} placeholder="Website" className="border p-2 rounded bg-gray-50 dark:bg-black" />}
      {visibility.showInstagram && <input name="instagram" defaultValue={initialData?.instagram} placeholder="Instagram URL" className="border p-2 rounded bg-gray-50 dark:bg-black" />}
      {visibility.showLinkedin && <input name="linkedin" defaultValue={initialData?.linkedin} placeholder="LinkedIn URL" className="border p-2 rounded bg-gray-50 dark:bg-black" />}
      {visibility.showGoogleReviews && <input name="googleReviews" defaultValue={initialData?.googleReviews} placeholder="Google Reviews URL" className="border p-2 rounded bg-gray-50 dark:bg-black" />}

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
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1">
          {initialData ? "Update" : "Add"} Employee
        </Button>
      </div>
    </form>
  );
}
