"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import Modal from "@/components/ui/modal";
import EmployeeForm from "@/components/EmployeeForm";
import { deleteEmployee } from "@/app/actions";
import { Button } from "@/components/ui/button";

interface Employee {
    id: string;
    name: string;
    slug: string;
    jobTitle: string | null;
    photoUrl: string | null;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    website: string | null;
    instagram: string | null;
    linkedin: string | null;
    googleReviews: string | null;
    companyId: string;
    customFieldValues: any[];
    _count?: {
        clickLogs: number;
    };
}

export default function EmployeeList({
    employees,
    companyId,
    customFields = [],
    fieldVisibility,
    employeeCustomFieldValues = []
}: {
    employees: Employee[],
    companyId: string,
    customFields?: any[],
    fieldVisibility?: any,
    employeeCustomFieldValues?: any[]
}) {
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

    const handleDelete = async () => {
        if (!deletingEmployee) return;

        const formData = new FormData();
        formData.append("id", deletingEmployee.id);
        formData.append("companyId", companyId);

        await deleteEmployee(formData);
        setDeletingEmployee(null);
    };

    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold">Empleados</h2>
            <div className="grid gap-3">
                {employees.length === 0 && (
                    <p className="text-gray-500 italic">No hay empleados todavía.</p>
                )}
                {employees.map((emp) => (
                    <div key={emp.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                            {emp.photoUrl ? (
                                <img
                                    src={emp.photoUrl}
                                    alt={emp.name}
                                    className="w-10 h-10 rounded-full object-cover bg-gray-100"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                    {emp.name[0]}
                                </div>
                            )}

                            <div>
                                <p className="text-sm font-medium text-black dark:text-white line-clamp-1">{emp.name}</p>
                                <p className="text-xs text-gray-500 line-clamp-1">{emp.jobTitle}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full font-medium">
                                        {emp._count?.clickLogs || 0} interacciones
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setEditingEmployee(emp)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                title="Editar Empleado"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={() => setDeletingEmployee(emp)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                title="Eliminar Empleado"
                            >
                                <Trash2 size={16} />
                            </button>
                            <Link
                                href={`/${emp.slug}`}
                                target="_blank"
                                className="flex items-center gap-1 text-sm text-blue-600 hover:underline ml-1"
                            >
                                <span className="font-mono bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">/{emp.slug}</span>
                                <ExternalLink size={14} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={!!editingEmployee}
                onClose={() => setEditingEmployee(null)}
                title="Editar Empleado"
            >
                {editingEmployee && (
                    <EmployeeForm
                        companyId={companyId}
                        initialData={editingEmployee}
                        onCancel={() => setEditingEmployee(null)}
                        customFields={customFields}
                        fieldVisibility={fieldVisibility}
                        customFieldValues={editingEmployee.customFieldValues || []}
                    />
                )}
            </Modal>

            <Modal
                isOpen={!!deletingEmployee}
                onClose={() => setDeletingEmployee(null)}
                title="Eliminar Empleado"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        ¿Estás seguro de que quieres eliminar a <span className="font-semibold text-black dark:text-white">{deletingEmployee?.name}</span>? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeletingEmployee(null)}>
                            Cancelar
                        </Button>
                        <form action={handleDelete}>
                            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                                Eliminar
                            </Button>
                        </form>
                    </div>
                </div>
            </Modal>
        </section>
    );
}
