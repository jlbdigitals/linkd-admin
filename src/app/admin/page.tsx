import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Building2, Plus, Users, Trash2 } from "lucide-react";
import Link from "next/link";
import { createCompany } from "../actions";
import CompanyLimitForm from "@/components/CompanyLimitForm";
import DeleteCompanyButton from "@/components/DeleteCompanyButton";

export default async function AdminDashboard() {
    const companies = await prisma.company.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { employees: true }
            }
        }
    });

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
                    <p className="text-muted-foreground">Gestionar Empresas</p>
                </div>
                <Link
                    href="/admin/trash"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
                >
                    <Trash2 size={16} />
                    Papelera de Reciclaje
                </Link>
            </header>

            <section className="space-y-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Crear Nueva Empresa</h2>
                    <form action={createCompany} className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                name="name"
                                placeholder="Nombre de la Empresa"
                                className="border p-2 rounded flex-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                required
                            />
                            <input
                                type="email"
                                name="ownerEmail"
                                placeholder="Email del Dueño (Acceso Admin)"
                                className="border p-2 rounded flex-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                required
                            />
                            <input
                                type="number"
                                name="maxEmployees"
                                placeholder="Límite (5)"
                                className="border p-2 rounded w-28 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                defaultValue={5}
                                min={1}
                            />
                        </div>
                        <Button type="submit" className="w-full gap-2 py-6 text-lg">
                            <Plus size={20} />
                            Crear Nueva Empresa
                        </Button>
                    </form>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {companies.map((company) => (
                        <div
                            key={company.id}
                            className="bg-white border border-gray-200 p-6 rounded-xl hover:shadow-md transition-shadow flex justify-between items-center group relative"
                        >
                            <Link
                                href={`/admin/company/${company.id}`}
                                className="absolute inset-0 z-0"
                            />
                            <div className="flex items-center gap-4 z-10 pointer-events-none">
                                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                                    <Building2 size={24} className="text-gray-700" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900">{company.name}</h3>
                                    <div className="text-sm text-gray-600 space-y-1 z-10 pointer-events-auto">
                                        <p>{company._count.employees} empleados</p>
                                        <CompanyLimitForm key={company.id} companyId={company.id} maxEmployees={company.maxEmployees} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 z-10">
                                <Users size={20} className="text-gray-400 group-hover:text-black transition-colors" />
                                <DeleteCompanyButton
                                    companyId={company.id}
                                    companyName={company.name}
                                    employeeCount={company._count.employees}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
