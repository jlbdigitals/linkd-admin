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
    isAdmin: boolean;
    customFieldValues: any[];
    _count?: {
        clickLogs: number;
    };
}

export default function EmployeeList({
    employees,
    companyId,
    companySlug,
    customFields = [],
    fieldVisibility,
    employeeCustomFieldValues = []
}: {
    employees: Employee[],
    companyId: string,
    companySlug: string,
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
            <h2 className="text-xl font-semibold text-foreground">Empleados</h2>
            <div className="grid gap-3">
                {employees.length === 0 && (
                    <p className="text-muted-foreground italic">No hay empleados todavía.</p>
                )}
                {employees.map((emp) => (
                    <div key={emp.id} className="bg-card p-4 rounded-xl border border-border flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                            {emp.photoUrl ? (
                                <img
                                    src={emp.photoUrl}
                                    alt={emp.name}
                                    className="w-10 h-10 rounded-full object-cover bg-muted"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                                    {emp.name[0]}
                                </div>
                            )}

                            <div>
                                <p className="text-sm font-medium text-foreground line-clamp-1">{emp.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{emp.jobTitle}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                                        {emp._count?.clickLogs || 0} interacciones
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setEditingEmployee(emp)}
                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                title="Editar Empleado"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={() => setDeletingEmployee(emp)}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                title="Eliminar Empleado"
                            >
                                <Trash2 size={16} />
                            </button>
                            <Link
                                href={`/${companySlug}/${emp.slug}`}
                                target="_blank"
                                className="flex items-center gap-1 text-sm text-primary hover:underline ml-1"
                            >
                                <span className="font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">/{emp.slug}</span>
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
                    <p className="text-muted-foreground">
                        ¿Estás seguro de que quieres eliminar a <span className="font-semibold text-foreground">{deletingEmployee?.name}</span>? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeletingEmployee(null)}>
                            Cancelar
                        </Button>
                        <form action={handleDelete}>
                            <Button type="submit" variant="destructive">
                                Eliminar
                            </Button>
                        </form>
                    </div>
                </div>
            </Modal>
        </section>
    );
}
