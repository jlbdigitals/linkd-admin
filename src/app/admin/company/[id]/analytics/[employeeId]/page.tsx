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
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                    <ArrowLeft size={16} /> Volver a Analíticas de Empresa
                </Link>
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted overflow-hidden relative">
                        {employee.photoUrl ? (
                            <img src={employee.photoUrl} alt={employee.name} className="object-cover w-full h-full" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-lg font-bold text-muted-foreground">
                                {employee.name[0]}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{employee.name}</h1>
                        <p className="text-muted-foreground">{employee.jobTitle}</p>
                    </div>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Eye size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Vistas de Perfil</p>
                            <p className="text-2xl font-bold text-foreground">{totalViews}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg">
                            <MousePointer2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Clics Totales</p>
                            <p className="text-2xl font-bold text-foreground">{totalClicks}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Tasa de Conversión (CTR)</p>
                            <p className="text-2xl font-bold text-foreground">{ctr}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Channel Breakdown */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm h-fit">
                    <h3 className="text-lg font-semibold mb-6 text-foreground">Canales Preferidos</h3>
                    <div className="space-y-4">
                        {clicksByType.length === 0 && <p className="text-muted-foreground italic">No hay datos suficientes.</p>}
                        {clicksByType
                            .sort((a, b) => b._count._all - a._count._all)
                            .map((item) => (
                                <div key={item.buttonType} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="capitalize font-medium text-muted-foreground">
                                            {item.buttonType || "Otro"}
                                        </span>
                                        <span className="font-bold text-foreground">{item._count._all}</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
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
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-foreground">
                        <Calendar size={18} />
                        Actividad Reciente
                    </h3>
                    <div className="space-y-0 divide-y divide-border">
                        {recentActivity.length === 0 && <p className="text-muted-foreground italic">No hay actividad reciente.</p>}
                        {recentActivity.map((log) => (
                            <div key={log.id} className="py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-full ${log.interactionType === 'CLICK'
                                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                        }`}>
                                        {log.interactionType === 'CLICK' ? <MousePointer2 size={12} /> : <Eye size={12} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {log.interactionType === 'CLICK' ? `Clic en ${log.buttonType}` : 'Perfil visitado'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(log.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground font-mono">
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
