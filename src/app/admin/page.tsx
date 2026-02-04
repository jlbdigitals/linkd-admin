import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Building2, Plus, Users, Trash2 } from "lucide-react";
import Link from "next/link";
import { createCompany } from "../actions";
import CompanyLimitForm from "@/components/CompanyLimitForm";
import DeleteCompanyButton from "@/components/DeleteCompanyButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = 'force-dynamic';

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
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Panel de Control</h1>
                    <p className="text-muted-foreground">Gestionar Empresas</p>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link
                        href="/admin/trash"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Trash2 size={16} />
                        Papelera de Reciclaje
                    </Link>
                </div>
            </header>

            <section className="space-y-4">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-card-foreground">Crear Nueva Empresa</h2>
                    <form action={createCompany} className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                name="name"
                                placeholder="Nombre de la Empresa"
                                className="border p-2 rounded flex-1 bg-background border-input text-foreground placeholder:text-muted-foreground"
                                required
                            />
                            <input
                                type="email"
                                name="ownerEmail"
                                placeholder="Email del Dueño (Acceso Admin)"
                                className="border p-2 rounded flex-1 bg-background border-input text-foreground placeholder:text-muted-foreground"
                                required
                            />
                            <input
                                type="number"
                                name="maxEmployees"
                                placeholder="Límite (5)"
                                className="border p-2 rounded w-28 bg-background border-input text-foreground placeholder:text-muted-foreground"
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
                            className="bg-card border border-border p-6 rounded-xl hover:shadow-md transition-shadow flex justify-between items-center group relative"
                        >
                            <Link
                                href={`/admin/company/${company.id}`}
                                className="absolute inset-0 z-0"
                            />
                            <div className="flex items-center gap-4 z-10 pointer-events-none">
                                <div className="p-3 bg-muted rounded-lg group-hover:bg-accent transition-colors">
                                    <Building2 size={24} className="text-muted-foreground group-hover:text-accent-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-card-foreground">{company.name}</h3>
                                    <div className="text-sm text-muted-foreground space-y-1 z-10 pointer-events-auto">
                                        <p>{company._count.employees} empleados</p>
                                        <CompanyLimitForm key={company.id} companyId={company.id} maxEmployees={company.maxEmployees} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 z-10">
                                <Users size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
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
