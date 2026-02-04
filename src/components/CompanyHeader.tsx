"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, MessageCircle, Mail, Globe } from "lucide-react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { updateCompany } from "@/app/actions";

interface Company {
    id: string;
    name: string;
    employees: any[];
    colorTop?: string | null;
    colorBottom?: string | null;
    gradientAngle?: number | null;
    bgImageUrl?: string | null;
    customFields: any[];
    fieldVisibility: any;
    isLightText: boolean;
}

export default function CompanyHeader({ company }: { company: Company }) {
    const [isEditing, setIsEditing] = useState(false);

    // Estados para preview en tiempo real
    const [previewColorTop, setPreviewColorTop] = useState(company.colorTop || "#ffffff");
    const [previewColorBottom, setPreviewColorBottom] = useState(company.colorBottom || "#a1a1aa");
    const [previewAngle, setPreviewAngle] = useState(company.gradientAngle || 135);
    const [previewLightText, setPreviewLightText] = useState(company.isLightText);

    const resetPreview = () => {
        setPreviewColorTop(company.colorTop || "#ffffff");
        setPreviewColorBottom(company.colorBottom || "#a1a1aa");
        setPreviewAngle(company.gradientAngle || 135);
        setPreviewLightText(company.isLightText);
    };

    return (
        <header className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                    <ArrowLeft size={16} /> Volver al Tablero
                </Link>
                <Link
                    href={`/admin/company/${company.id}/analytics`}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                    <BarChart3 size={16} />
                    Ver Estadísticas
                </Link>
            </div>
            <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{company.name}</h1>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                    >
                        Editar
                    </Button>
                </div>
                <p className="text-muted-foreground">{company.employees.length} Empleados</p>
            </div>

            <Modal
                isOpen={isEditing}
                onClose={() => { setIsEditing(false); resetPreview(); }}
                title="Editar Empresa"
            >
                <div className="flex gap-6">
                    {/* Formulario */}
                    <form
                        action={async (formData) => {
                            await updateCompany(formData);
                            setIsEditing(false);
                        }}
                        className="flex flex-col gap-4 flex-1"
                    >
                        <input type="hidden" name="id" value={company.id} />
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Nombre de la Empresa</label>
                            <input
                                name="name"
                                defaultValue={company.name}
                                className="w-full border p-2 rounded bg-background border-input text-foreground font-semibold text-lg"
                                required
                            />
                        </div>

                        <div className="bg-muted/50 p-4 rounded-lg space-y-4 border border-border">
                            <h3 className="text-sm font-bold text-foreground">Colores de Marca y Landing Page</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Color Superior (Top)</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            name="colorTop"
                                            value={previewColorTop}
                                            onChange={(e) => setPreviewColorTop(e.target.value)}
                                            className="w-10 h-10 flex-shrink-0 border border-border rounded-full bg-transparent p-0 overflow-hidden cursor-pointer appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full"
                                        />
                                        <input
                                            type="text"
                                            value={previewColorTop}
                                            onChange={(e) => setPreviewColorTop(e.target.value)}
                                            className="border border-input p-1.5 rounded bg-background text-foreground w-full text-xs font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Color Inferior (Bottom)</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            name="colorBottom"
                                            value={previewColorBottom}
                                            onChange={(e) => setPreviewColorBottom(e.target.value)}
                                            className="w-10 h-10 flex-shrink-0 border border-border rounded-full bg-transparent p-0 overflow-hidden cursor-pointer appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full"
                                        />
                                        <input
                                            type="text"
                                            value={previewColorBottom}
                                            onChange={(e) => setPreviewColorBottom(e.target.value)}
                                            className="border border-input p-1.5 rounded bg-background text-foreground w-full text-xs font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Ángulo del Degradado (Grados)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        name="gradientAngle"
                                        value={previewAngle}
                                        onChange={(e) => setPreviewAngle(Number(e.target.value))}
                                        min="0"
                                        max="360"
                                        className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                    />
                                    <input
                                        type="number"
                                        value={previewAngle}
                                        onChange={(e) => setPreviewAngle(Number(e.target.value))}
                                        className="w-16 border border-input p-2 rounded bg-background text-foreground text-xs font-mono text-center"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-border">
                                <input
                                    type="checkbox"
                                    id="isLightText"
                                    name="isLightText"
                                    checked={previewLightText}
                                    onChange={(e) => setPreviewLightText(e.target.checked)}
                                    value="true"
                                    className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary"
                                />
                                <label htmlFor="isLightText" className="text-sm font-medium text-foreground cursor-pointer">
                                    Texto blanco
                                </label>
                            </div>

                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => { setIsEditing(false); resetPreview(); }}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                Guardar Cambios
                            </Button>
                        </div>
                    </form>

                    {/* Preview Miniatura */}
                    <div className="w-48 flex-shrink-0">
                        <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Vista previa</p>
                        <div
                            className="rounded-xl overflow-hidden shadow-lg border border-border"
                            style={{
                                background: `linear-gradient(${previewAngle}deg, ${previewColorTop} 0%, ${previewColorBottom} 100%)`,
                                aspectRatio: "9/16",
                            }}
                        >
                            <div className="h-full flex flex-col items-center justify-center p-3">
                                {/* Avatar placeholder */}
                                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mb-2">
                                    <span className="text-lg font-bold text-gray-400">JD</span>
                                </div>

                                {/* Nombre */}
                                <p className={`text-xs font-bold ${previewLightText ? "text-white" : "text-gray-900"}`}>
                                    Juan Pérez
                                </p>
                                <p className={`text-[10px] ${previewLightText ? "text-white/80" : "text-gray-600"}`}>
                                    Director
                                </p>
                                <p className={`text-[8px] uppercase tracking-wide mt-0.5 ${previewLightText ? "text-white/60" : "text-gray-500"}`}>
                                    {company.name}
                                </p>

                                {/* Botones de ejemplo */}
                                <div className="w-full mt-3 space-y-1.5 px-2">
                                    <div className="bg-white/90 rounded-md py-1.5 px-2 flex items-center gap-1.5 shadow-sm">
                                        <MessageCircle size={10} className="text-green-600" />
                                        <span className="text-[8px] font-medium text-gray-700">WhatsApp</span>
                                    </div>
                                    <div className="bg-white/90 rounded-md py-1.5 px-2 flex items-center gap-1.5 shadow-sm">
                                        <Mail size={10} className="text-blue-600" />
                                        <span className="text-[8px] font-medium text-gray-700">Email</span>
                                    </div>
                                    <div className="bg-white/90 rounded-md py-1.5 px-2 flex items-center gap-1.5 shadow-sm">
                                        <Globe size={10} className="text-purple-600" />
                                        <span className="text-[8px] font-medium text-gray-700">Sitio web</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </header>
    );
}
