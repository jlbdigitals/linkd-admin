import { ArrowLeft, Calendar, Eye, MousePointer2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEmployeeAnalytics } from "../actions";

export const dynamic = 'force-dynamic';

export default async function EmployeeAnalyticsPage({
    params,
}: {
    params: Promise<{ id: string; employeeId: string }>;
}) {
    const { id, employeeId } = await params;

    // Fetch data using the server action we just created
    // Note: We need to import it. Since it's in the parent directory's actions.ts, we import from "../actions"
    const data = await getEmployeeAnalytics(employeeId);

    if (!data || !data.employee) {
        notFound();
    }

    const { employee, totalViews, totalClicks, clicksByType, recentActivity } = data;

    const ctr = totalViews > 0 ? (totalClicks / totalViews * 100).toFixed(1) : "0.0";

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex flex-col gap-4">
                <Link
                    href={`/admin/company/${id}/analytics`}
                    className="text-sm text-gray-500 hover:text-black flex items-center gap-1"
                >
                    <ArrowLeft size={16} /> Volver a Analíticas de Empresa
                </Link>
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden relative">
                        {employee.photoUrl ? (
                            <img src={employee.photoUrl} alt={employee.name} className="object-cover w-full h-full" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-lg font-bold text-gray-500">
                                {employee.name[0]}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{employee.name}</h1>
                        <p className="text-muted-foreground">{employee.jobTitle}</p>
                    </div>
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
                            <p className="text-sm text-gray-500 font-medium">Vistas de Perfil</p>
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
                            <p className="text-sm text-gray-500 font-medium">Clics Totales</p>
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
                            <p className="text-sm text-gray-500 font-medium">Tasa de Conversión (CTR)</p>
                            <p className="text-2xl font-bold">{ctr}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Channel Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
                    <h3 className="text-lg font-semibold mb-6">Canales Preferidos</h3>
                    <div className="space-y-4">
                        {clicksByType.length === 0 && <p className="text-gray-500 italic">No hay datos suficientes.</p>}
                        {clicksByType
                            .sort((a, b) => b._count._all - a._count._all)
                            .map((item) => (
                                <div key={item.buttonType} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="capitalize font-medium text-gray-700">
                                            {item.buttonType || "Otro"}
                                        </span>
                                        <span className="font-bold">{item._count._all}</span>
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

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Calendar size={18} />
                        Actividad Reciente
                    </h3>
                    <div className="space-y-0 divide-y">
                        {recentActivity.length === 0 && <p className="text-gray-500 italic">No hay actividad reciente.</p>}
                        {recentActivity.map((log) => (
                            <div key={log.id} className="py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-full ${log.interactionType === 'CLICK'
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {log.interactionType === 'CLICK' ? <MousePointer2 size={12} /> : <Eye size={12} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {log.interactionType === 'CLICK' ? `Clic en ${log.buttonType}` : 'Perfil visitado'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(log.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 font-mono">
                                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
