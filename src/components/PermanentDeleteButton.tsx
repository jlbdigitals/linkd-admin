"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { permanentDeleteCompany } from "@/app/actions";

export default function PermanentDeleteButton({ companyId }: { companyId: string }) {
    const handleDelete = async () => {
        if (confirm("¿Realmente quieres borrar esta empresa de forma PERMANENTE? Esta acción no se puede deshacer.")) {
            const formData = new FormData();
            formData.append("id", companyId);
            await permanentDeleteCompany(formData);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
        >
            <Trash2 size={16} />
        </Button>
    );
}
