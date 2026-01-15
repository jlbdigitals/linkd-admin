import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ExternalLink, Plus, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createEmployee } from "@/app/actions";

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
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!company) notFound();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 sm:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <header className="flex flex-col gap-4">
                    <Link href="/admin" className="text-sm text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
                        <p className="text-muted-foreground">{company.employees.length} Employees</p>
                    </div>
                </header>

                <div className="grid lg:grid-cols-[1fr_350px] gap-8">
                    {/* Employee List */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold">Employees</h2>
                        <div className="grid gap-3">
                            {company.employees.length === 0 && (
                                <p className="text-gray-500 italic">No employees yet.</p>
                            )}
                            {company.employees.map((emp) => (
                                <div key={emp.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                            {emp.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium">{emp.name}</p>
                                            <p className="text-xs text-gray-500">{emp.jobTitle}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/${emp.slug}`}
                                        target="_blank"
                                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                    >
                                        <span className="font-mono bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">/{emp.slug}</span>
                                        <ExternalLink size={14} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Add Employee Sidebar */}
                    <aside className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 h-fit sticky top-8">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <User size={20} />
                            Add Employee
                        </h2>
                        <form action={createEmployee} className="flex flex-col gap-3">
                            <input type="hidden" name="companyId" value={company.id} />

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Full Name</label>
                                <input name="name" placeholder="John Doe" className="w-full border p-2 rounded bg-gray-50 dark:bg-black" required />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Job Title</label>
                                <input name="jobTitle" placeholder="Sales Manager" className="w-full border p-2 rounded bg-gray-50 dark:bg-black" />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <input name="email" placeholder="Email" className="border p-2 rounded bg-gray-50 dark:bg-black" />
                                <input name="phone" placeholder="Phone" className="border p-2 rounded bg-gray-50 dark:bg-black" />
                            </div>

                            <input name="whatsapp" placeholder="WhatsApp (e.g. +569...)" className="border p-2 rounded bg-gray-50 dark:bg-black" />
                            <input name="website" placeholder="Website" className="border p-2 rounded bg-gray-50 dark:bg-black" />
                            <input name="instagram" placeholder="Instagram URL" className="border p-2 rounded bg-gray-50 dark:bg-black" />
                            <input name="linkedin" placeholder="LinkedIn URL" className="border p-2 rounded bg-gray-50 dark:bg-black" />
                            <input name="googleReviews" placeholder="Google Reviews URL" className="border p-2 rounded bg-gray-50 dark:bg-black" />

                            <Button type="submit" className="w-full mt-2">
                                Add Employee
                            </Button>
                        </form>
                    </aside>
                </div>
            </div>
        </div>
    );
}
