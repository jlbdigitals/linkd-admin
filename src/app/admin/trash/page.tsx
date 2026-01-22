import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Building2 } from "lucide-react";
import Link from "next/link";
import { restoreCompany } from "@/app/actions";
import PermanentDeleteButton from "@/components/PermanentDeleteButton";

export default async function TrashPage() {
    const deletedCompanies = await prisma.company.findMany({
        where: {
            deletedAt: { not: null }
        },
        orderBy: { deletedAt: "desc" },
        include: {
            _count: {
                select: { employees: true }
            }
        }
    });

    const calculateDaysLeft = (deletedAt: Date) => {
        const now = new Date();
        const expirationDate = new Date(deletedAt);
        expirationDate.setDate(expirationDate.getDate() + 30);
        const diffTime = expirationDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex flex-col gap-4">
                <Link
                    href="/admin"
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors"
                >
                    <ArrowLeft size={16} /> Volver al Panel
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Papelera de Reciclaje</h1>
                    <p className="text-muted-foreground">Las empresas se eliminarán permanentemente después de 30 días.</p>
                </div>
            </header>

            <section className="space-y-4">
                {deletedCompanies.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                        <p className="text-gray-500 italic">No hay empresas en la papelera.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {deletedCompanies.map((company) => {
                            const daysLeft = calculateDaysLeft(company.deletedAt!);
                            return (
                                <div
                                    key={company.id}
                                    className="bg-white border border-gray-200 p-6 rounded-xl flex justify-between items-center group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gray-100 rounded-lg">
                                            <Building2 size={24} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900">{company.name}</h3>
                                            <p className="text-sm text-gray-500">
                                                {company._count.employees} empleados • Eliminado el {company.deletedAt?.toLocaleDateString()}
                                            </p>
                                            <p className={`text-xs font-medium mt-1 ${daysLeft < 7 ? 'text-red-500' : 'text-orange-500'}`}>
                                                Quedan {daysLeft} días para eliminación permanente
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <form action={restoreCompany}>
                                            <input type="hidden" name="id" value={company.id} />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                                            >
                                                <RotateCcw size={16} />
                                                Restaurar
                                            </Button>
                                        </form>
                                        <PermanentDeleteButton companyId={company.id} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
