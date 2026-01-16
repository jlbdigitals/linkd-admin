"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
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
}

export default function CompanyHeader({ company }: { company: Company }) {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <header className="flex flex-col gap-4">
            <Link href="/admin" className="text-sm text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>
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
                <p className="text-muted-foreground">{company.employees.length} Employees</p>
            </div>

            <Modal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                title="Edit Company"
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
                        <label className="text-xs font-medium text-gray-500">Company Name</label>
                        <input
                            name="name"
                            defaultValue={company.name}
                            className="w-full border p-2 rounded bg-gray-50 dark:bg-black"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Top Color</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    name="colorTop"
                                    defaultValue={company.colorTop || "#ffffff"}
                                    className="h-10 w-10 border rounded bg-transparent p-0 overflow-hidden cursor-pointer"
                                />
                                <input
                                    type="text"
                                    defaultValue={company.colorTop || "#ffffff"}
                                    className="border p-2 rounded bg-gray-50 dark:bg-black w-full text-xs font-mono"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Bottom Color</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    name="colorBottom"
                                    defaultValue={company.colorBottom || "#a1a1aa"}
                                    className="h-10 w-10 border rounded bg-transparent p-0 overflow-hidden cursor-pointer"
                                />
                                <input
                                    type="text"
                                    defaultValue={company.colorBottom || "#a1a1aa"}
                                    className="border p-2 rounded bg-gray-50 dark:bg-black w-full text-xs font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Gradient Angle (Degrees)</label>
                        <input
                            type="number"
                            name="gradientAngle"
                            defaultValue={company.gradientAngle || 135}
                            min="0"
                            max="360"
                            className="w-full border p-2 rounded bg-gray-50 dark:bg-black"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>
        </header>
    );
}
