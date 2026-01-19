"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, BarChart3 } from "lucide-react";
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

    return (
        <header className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <Link href="/admin" className="text-sm text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1">
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
                    <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Pencil size={18} />
                    </button>
                </div>
                <p className="text-muted-foreground">{company.employees.length} Empleados</p>
            </div>

            <Modal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                title="Editar Empresa"
            >
                <form
                    action={async (formData) => {
                        await updateCompany(formData);
                        setIsEditing(false);
                    }}
                    className="flex flex-col gap-4"
                >
                    <input type="hidden" name="id" value={company.id} />
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Nombre de la Empresa</label>
                        <input
                            name="name"
                            defaultValue={company.name}
                            className="w-full border p-2 rounded bg-gray-50 dark:bg-black font-semibold text-lg"
                            required
                        />
                    </div>

                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg space-y-4 border border-gray-100 dark:border-zinc-800">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Colores de Marca y Landing Page</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Color Superior (Top)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        name="colorTop"
                                        defaultValue={company.colorTop || "#ffffff"}
                                        className="h-12 w-12 border-2 border-white dark:border-zinc-700 rounded-lg bg-transparent p-0 overflow-hidden cursor-pointer shadow-sm"
                                    />
                                    <input
                                        type="text"
                                        defaultValue={company.colorTop || "#ffffff"}
                                        className="border p-2 rounded bg-white dark:bg-black w-full text-xs font-mono h-12"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Color Inferior (Bottom)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        name="colorBottom"
                                        defaultValue={company.colorBottom || "#a1a1aa"}
                                        className="h-12 w-12 border-2 border-white dark:border-zinc-700 rounded-lg bg-transparent p-0 overflow-hidden cursor-pointer shadow-sm"
                                    />
                                    <input
                                        type="text"
                                        defaultValue={company.colorBottom || "#a1a1aa"}
                                        className="border p-2 rounded bg-white dark:bg-black w-full text-xs font-mono h-12"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Ángulo del Degradado (Grados)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    name="gradientAngle"
                                    defaultValue={company.gradientAngle || 135}
                                    min="0"
                                    max="360"
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    onInput={(e) => {
                                        const next = e.currentTarget.nextElementSibling;
                                        if (next) (next as HTMLInputElement).value = e.currentTarget.value;
                                    }}
                                />
                                <input
                                    type="number"
                                    defaultValue={company.gradientAngle || 135}
                                    className="w-16 border p-2 rounded bg-white dark:bg-black text-xs font-mono text-center"
                                    onChange={(e) => {
                                        const prev = e.currentTarget.previousElementSibling;
                                        if (prev) (prev as HTMLInputElement).value = e.currentTarget.value;
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                            <input
                                type="checkbox"
                                id="isLightText"
                                name="isLightText"
                                defaultChecked={company.isLightText}
                                value="true"
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="isLightText" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Usar texto claro (blanco) para fondos oscuros
                            </label>
                        </div>

                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </Modal>
        </header>
    );
}
