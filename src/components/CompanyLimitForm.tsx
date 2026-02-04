"use client";

import { updateCompanyLimit } from "@/app/actions";
import { Button } from "./ui/button";

export default function CompanyLimitForm({
    companyId,
    maxEmployees
}: {
    companyId: string;
    maxEmployees: number;
}) {
    return (
        <form
            action={updateCompanyLimit}
            className="flex items-center gap-2 mt-1"
            onClick={(e) => e.stopPropagation()}
        >
            <input type="hidden" name="id" value={companyId} />
            <label className="text-xs text-muted-foreground">Límite:</label>
            <input
                type="number"
                name="maxEmployees"
                defaultValue={maxEmployees}
                className="w-16 border rounded px-2 py-0.5 text-sm bg-background border-input text-foreground"
                min={1}
            />
            <button
                type="submit"
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
                Guardar
            </button>
        </form>
    );
}
