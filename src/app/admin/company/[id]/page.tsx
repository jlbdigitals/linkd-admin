import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ExternalLink, Plus, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import EmployeeForm from "@/components/EmployeeForm";
import EmployeeList from "@/components/EmployeeList";
import CompanyHeader from "@/components/CompanyHeader";
import CustomFieldManager from "@/components/CustomFieldManager";

export const dynamic = 'force-dynamic';

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
                    companySlug={company.slug}
                    customFields={company.customFields}
                    fieldVisibility={company.fieldVisibility}
                />

                {/* Add Employee Sidebar */}
                <aside className="bg-white p-6 rounded-xl border border-gray-200 h-fit sticky top-8">
                    <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <User size={20} />
                        Agregar Empleado
                    </h2>

                    {/* Employee Limit Indicator */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1 text-gray-600">
                            <span>Uso del Plan</span>
                            <span>{company.employees.length} / {company.maxEmployees}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full ${company.employees.length >= company.maxEmployees ? 'bg-red-500' : 'bg-blue-600'}`}
                                style={{ width: `${Math.min((company.employees.length / company.maxEmployees) * 100, 100)}%` }}
                            ></div>
                        </div>
                        {company.employees.length >= company.maxEmployees && (
                            <p className="text-xs text-red-500 mt-1 font-medium">Límite alcanzado.</p>
                        )}
                    </div>

                    <EmployeeForm
                        companyId={company.id}
                        customFields={company.customFields}
                        fieldVisibility={company.fieldVisibility}
                    />
                </aside>
            </div>
        </div>
    );
}
