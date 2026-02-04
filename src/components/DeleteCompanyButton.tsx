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
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
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
                    <p className="text-muted-foreground">
                        ¿Estás seguro de que quieres eliminar a <span className="font-semibold text-foreground">{companyName}</span>?
                    </p>
                    <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                        <p className="text-sm text-destructive">
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
