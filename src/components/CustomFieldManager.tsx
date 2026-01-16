"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import * as Icons from "lucide-react";
import { createCustomField, deleteCustomField, updateFieldVisibility } from "@/app/customFieldActions";

interface CustomField {
    id: string;
    label: string;
    icon: string;
    placeholder: string | null;
    order: number;
}

interface FieldVisibility {
    showWhatsapp: boolean;
    showEmail: boolean;
    showPhone: boolean;
    showWebsite: boolean;
    showInstagram: boolean;
    showLinkedin: boolean;
    showGoogleReviews: boolean;
}

interface Props {
    companyId: string;
    customFields: CustomField[];
    fieldVisibility: FieldVisibility | null;
}

const POPULAR_ICONS = [
    "Video", "Music", "Camera", "Heart", "Star", "Zap", "Coffee",
    "Book", "Briefcase", "Calendar", "Clock", "Code", "Database",
    "FileText", "Gift", "Globe", "Hash", "Home", "Image", "Link",
    "Mail", "MapPin", "MessageCircle", "Phone", "Share2", "ShoppingCart",
    "Smartphone", "Tag", "Truck", "Users", "Wifi", "Youtube"
];

const DEFAULT_FIELDS = [
    { key: "whatsapp", label: "WhatsApp" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Teléfono" },
    { key: "website", label: "Sitio Web" },
    { key: "instagram", label: "Instagram" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "googleReviews", label: "Google Reviews" }
];

export default function CustomFieldManager({ companyId, customFields, fieldVisibility }: Props) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showVisibilityModal, setShowVisibilityModal] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState("Link");

    const visibility = fieldVisibility || {
        showWhatsapp: true,
        showEmail: true,
        showPhone: true,
        showWebsite: true,
        showInstagram: true,
        showLinkedin: true,
        showGoogleReviews: false
    };

    const handleToggleVisibility = async (field: string, currentValue: boolean) => {
        const formData = new FormData();
        formData.append("companyId", companyId);
        formData.append("field", field);
        formData.append("visible", (!currentValue).toString());
        await updateFieldVisibility(formData);
    };

    const IconComponent = (Icons as any)[selectedIcon] || Icons.Link;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Campos de Contacto</h3>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowVisibilityModal(true)}
                        className="gap-2"
                    >
                        <Eye size={16} />
                        Visibilidad
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setShowAddModal(true)}
                        className="gap-2"
                    >
                        <Plus size={16} />
                        Campo Personalizado
                    </Button>
                </div>
            </div>

            {/* Custom Fields List */}
            {customFields.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm text-gray-500">Campos Personalizados:</p>
                    {customFields.map((field) => {
                        const FieldIcon = (Icons as any)[field.icon] || Icons.Link;
                        return (
                            <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <FieldIcon size={18} className="text-gray-600" />
                                    <span className="font-medium">{field.label}</span>
                                </div>
                                <form action={deleteCustomField}>
                                    <input type="hidden" name="id" value={field.id} />
                                    <input type="hidden" name="companyId" value={companyId} />
                                    <Button
                                        type="submit"
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </form>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Custom Field Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Agregar Campo Personalizado">
                <form action={createCustomField} className="space-y-4">
                    <input type="hidden" name="companyId" value={companyId} />
                    <input type="hidden" name="icon" value={selectedIcon} />

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Nombre del Campo</label>
                        <input
                            name="label"
                            placeholder="ej: TikTok, YouTube, etc."
                            className="w-full border p-2 rounded bg-gray-50 dark:bg-black"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Placeholder (opcional)</label>
                        <input
                            name="placeholder"
                            placeholder="ej: URL de TikTok"
                            className="w-full border p-2 rounded bg-gray-50 dark:bg-black"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Ícono</label>
                        <div className="flex items-center gap-2 p-2 border rounded bg-gray-50 dark:bg-black">
                            <IconComponent size={20} />
                            <span className="text-sm">{selectedIcon}</span>
                        </div>
                        <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 border rounded">
                            {POPULAR_ICONS.map((iconName) => {
                                const Icon = (Icons as any)[iconName];
                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => setSelectedIcon(iconName)}
                                        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 ${selectedIcon === iconName ? "bg-blue-100 dark:bg-blue-900" : ""
                                            }`}
                                    >
                                        <Icon size={20} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            Agregar
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Field Visibility Modal */}
            <Modal isOpen={showVisibilityModal} onClose={() => setShowVisibilityModal(false)} title="Visibilidad de Campos">
                <div className="space-y-3">
                    <p className="text-sm text-gray-600">Activa o desactiva los campos predeterminados:</p>
                    {DEFAULT_FIELDS.map((field) => {
                        const isVisible = (visibility as any)[`show${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`];
                        return (
                            <div key={field.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                                <span className="font-medium">{field.label}</span>
                                <button
                                    onClick={() => handleToggleVisibility(field.key, isVisible)}
                                    className={`p-2 rounded-full transition-colors ${isVisible
                                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                                            : "bg-gray-200 text-gray-400 hover:bg-gray-300"
                                        }`}
                                >
                                    {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </Modal>
        </div>
    );
}
