import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ExternalLink, Plus, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import EmployeeForm from "@/components/EmployeeForm";
import EmployeeList from "@/components/EmployeeList";
import CompanyHeader from "@/components/CompanyHeader";
import CustomFieldManager from "@/components/CustomFieldManager";

export default async function CompanyPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const company = await prisma.company.findUnique({
        where: { id },
        include: {
            employees: {
                orderBy: { createdAt: "desc" },
                include: {
                    customFieldValues: {
                        include: {
                            customField: true
                        }
                    },
                    _count: {
                        select: { clickLogs: true }
                    }
                }
            },
            customFields: {
                orderBy: { order: "asc" }
            },
            fieldVisibility: true
        }
    });

    if (!company) notFound();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 sm:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <CompanyHeader company={company} />

                {/* Custom Fields Manager */}
                <CustomFieldManager
                    companyId={company.id}
                    customFields={company.customFields}
                    fieldVisibility={company.fieldVisibility}
                />

                <div className="grid lg:grid-cols-[1fr_350px] gap-8">
                    {/* Employee List */}
                    <EmployeeList
                        employees={company.employees}
                        companyId={company.id}
                        customFields={company.customFields}
                        fieldVisibility={company.fieldVisibility}
                    />

                    {/* Add Employee Sidebar */}
                    <aside className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 h-fit sticky top-8">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <User size={20} />
                            Agregar Empleado
                        </h2>
                        <EmployeeForm
                            companyId={company.id}
                            customFields={company.customFields}
                            fieldVisibility={company.fieldVisibility}
                        />
                    </aside>
                </div>
            </div>
        </div>
    );
}
