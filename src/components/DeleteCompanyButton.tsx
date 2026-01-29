"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import Modal from "./ui/modal";
import { Button } from "./ui/button";
import { softDeleteCompany } from "@/app/actions";

interface Props {
    companyId: string;
    companyName: string;
    employeeCount: number;
}

export default function DeleteCompanyButton({ companyId, companyName, employeeCount }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Eliminar Empresa"
            >
                <Trash2 size={20} />
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="¿Eliminar Empresa?"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        ¿Estás seguro de que quieres eliminar a <span className="font-semibold text-black">{companyName}</span>?
                    </p>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                        <p className="text-sm text-red-600">
                            <strong>Aviso:</strong> Esta empresa tiene <strong>{employeeCount}</strong> empleado(s) que también serán enviados a la papelera. Podrás restaurarlos desde la papelera en los próximos 30 días.
                        </p>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancelar
                        </Button>
                        <form action={softDeleteCompany} onSubmit={() => setIsOpen(false)}>
                            <input type="hidden" name="id" value={companyId} />
                            <Button type="submit" variant="destructive">
                                Eliminar
                            </Button>
                        </form>
                    </div>
                </div>
            </Modal>
        </>
    );
}
