import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Building2, Plus, Users } from "lucide-react";
import Link from "next/link";
import { createCompany } from "../actions";

export default async function AdminDashboard() {
    const companies = await prisma.company.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { employees: true }
            }
        }
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Manage Companies</p>
                    </div>
                </header>

                <section className="space-y-4">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Create New Company</h2>
                        <form action={createCompany} className="flex gap-2">
                            <input name="name" placeholder="Company Name" className="border p-2 rounded flex-1 bg-white dark:bg-black" required />
                            <Button type="submit" className="gap-2">
                                <Plus size={16} />
                                Create
                            </Button>
                        </form>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {companies.map((company) => (
                            <Link
                                key={company.id}
                                href={`/admin/company/${company.id}`}
                                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-xl hover:shadow-md transition-shadow flex justify-between items-center group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-lg group-hover:bg-gray-200 transition-colors">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{company.name}</h3>
                                        <p className="text-sm text-gray-500">{company._count.employees} employees</p>
                                    </div>
                                </div>
                                <Users size={20} className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
