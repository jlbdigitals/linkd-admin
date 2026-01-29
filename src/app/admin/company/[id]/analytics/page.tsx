import { prisma } from "@/lib/prisma";
import { ArrowLeft, BarChart3, MousePointer2, Eye, TrendingUp } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AnalyticsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const company = await prisma.company.findUnique({
        where: { id },
        include: {
            employees: {
                include: {
                    _count: {
                        select: { clickLogs: true }
                    }
                }
            }
        }
    });

    if (!company) notFound();

    // Stats
    const totalInteractions = await prisma.clickLog.count({
        where: { employee: { companyId: id } }
    });

    const totalViews = await prisma.clickLog.count({
        where: {
            employee: { companyId: id },
            interactionType: "VIEW"
        }
    });

    const totalClicks = await prisma.clickLog.count({
        where: {
            employee: { companyId: id },
            interactionType: "CLICK"
        }
    });

    const clicksByType = await prisma.clickLog.groupBy({
        by: ['buttonType'],
        where: {
            employee: { companyId: id },
            interactionType: "CLICK"
        },
        _count: { _all: true }
    });

    // Best performing employee
    const bestEmployee = [...company.employees].sort((a, b) =>
        (b._count?.clickLogs || 0) - (a._count?.clickLogs || 0)
    )[0];

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header className="flex flex-col gap-4">
                <Link href={`/admin/company/${id}`} className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
                    <ArrowLeft size={16} /> Volver a la Empresa
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Análisis de {company.name}</h1>
                    <p className="text-muted-foreground">Rendimiento e interacciones en tiempo real</p>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Eye size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Vistas Totales</p>
                            <p className="text-2xl font-bold">{totalViews}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <MousePointer2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Clics en Botones</p>
                            <p className="text-2xl font-bold">{totalClicks}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Interacción Promedio</p>
                            <p className="text-2xl font-bold">
                                {totalViews > 0 ? (totalClicks / totalViews * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Top Employees Table */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 size={20} />
                        Desempeño por Empleado
                    </h3>
                    <div className="space-y-4">
                        {[...company.employees]
                            .sort((a, b) => (b._count?.clickLogs || 0) - (a._count?.clickLogs || 0))
                            .map((emp) => (
                                <Link
                                    href={`/admin/company/${id}/analytics/${emp.id}`}
                                    key={emp.id}
                                    className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold font-mono overflow-hidden">
                                            {emp.photoUrl ? (
                                                <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" />
                                            ) : emp.name[0]}
                                        </div>
                                        <span className="font-medium group-hover:text-blue-600 transition-colors">{emp.name}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-bold">{emp._count?.clickLogs || 0}</span>
                                        <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500"
                                                style={{ width: `${totalInteractions > 0 ? ((emp._count?.clickLogs || 0) / (bestEmployee?._count?.clickLogs || 1) * 100) : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        }
                    </div>
                </div>

                {/* Button Types Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Canales más Populares</h3>
                    <div className="space-y-6">
                        {clicksByType.length === 0 && <p className="text-gray-500 italic">No hay clics registrados todavía.</p>}
                        {clicksByType
                            .sort((a, b) => b._count._all - a._count._all)
                            .map((item) => (
                                <div key={item.buttonType} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="capitalize font-medium text-gray-700">{item.buttonType || "Otro"}</span>
                                        <span className="font-bold">{item._count._all} clics</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500"
                                            style={{ width: `${totalClicks > 0 ? (item._count._all / totalClicks * 100) : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
