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
            <label className="text-xs text-gray-600 dark:text-gray-300">Límite:</label>
            <input
                type="number"
                name="maxEmployees"
                defaultValue={maxEmployees}
                className="w-16 border rounded px-2 py-0.5 text-sm bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 text-gray-900 dark:text-white"
                min={1}
            />
            <button
                type="submit"
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
                Guardar
            </button>
        </form>
    );
}
