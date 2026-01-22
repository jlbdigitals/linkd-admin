import { Button } from "@/components/ui/button";
import { VCardButton } from "@/components/vcard-button";
import { prisma } from "@/lib/prisma";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { recordInteraction } from "@/app/analyticsActions";
import { TrackedActionButton } from "@/components/tracked-action-button";
import { getSession } from "@/lib/auth";
import { Pencil, Settings } from "lucide-react";



export default async function ProfilePage({
    params,
}: {
    params: Promise<{ companySlug: string; slug: string }>;
}) {
    const { companySlug, slug } = await params;

    const employee = await prisma.employee.findUnique({
        where: { slug },
        include: {
            company: true,
            customFieldValues: {
                include: {
                    customField: true
                },
                orderBy: {
                    customField: { order: "asc" }
                }
            }
        },
    });

    if (!employee || employee.company.slug !== companySlug) {
        notFound();
    }

    // Record profile view
    await recordInteraction(employee.id, "VIEW");

    const session = await getSession();
    const isSuperAdmin = session?.role === "SUPER_ADMIN";
    const isCompanyAdmin = session?.role === "COMPANY_ADMIN" && session?.companyId === employee.companyId;
    const isOwner = employee.company.ownerEmail && session?.email === employee.company.ownerEmail;
    const canEdit = isSuperAdmin || isCompanyAdmin || isOwner;

    const isLightText = employee.company.isLightText;

    return (
        <main className="min-h-screen flex flex-col items-center justify-between p-4 pt-[50px]"
            style={{
                background: `linear-gradient(${employee.company.gradientAngle || 135}deg, ${employee.company.colorTop || "#ffffff"} 0%, ${employee.company.colorBottom || "#a1a1aa"} 100%)`,
            }}
        >
            {/* Admin Floating Action Button */}
            {canEdit && (
                <div className="fixed top-4 right-4 z-[100] flex gap-2">
                    <Link
                        href={isSuperAdmin ? "/admin" : `/admin/company/${employee.companyId}`}
                        className="bg-white/90 backdrop-blur shadow-lg p-3 rounded-full hover:bg-white transition-all border border-gray-200 text-gray-700 flex items-center gap-2"
                        title="Panel de Control"
                    >
                        <Settings size={20} />
                        <span className="text-sm font-medium pr-1">Panel</span>
                    </Link>
                    <Link
                        href={`/admin/company/${employee.companyId}`}
                        className="bg-blue-600 shadow-lg p-3 rounded-full hover:bg-blue-700 transition-all text-white flex items-center gap-2"
                        title="Editar Tarjeta"
                    >
                        <Pencil size={20} />
                        <span className="text-sm font-medium pr-1">Editar</span>
                    </Link>
                </div>
            )}

            <div /> {/* Spacer for centering content vertically */}

            {/* Card Container */}
            <div className="w-full max-w-sm bg-transparent flex flex-col items-center relative">

                {/* Profile/Company Info */}
                <div className="flex flex-col items-center text-center mb-8 relative z-10">
                    <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden bg-white shadow-xl flex items-center justify-center p-1">
                        {/* Prefer Company Logo if available, else Employee Photo */}
                        {employee.photoUrl ? (
                            <Image
                                src={employee.photoUrl}
                                alt={employee.name}
                                fill
                                className="object-cover rounded-full"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400">
                                {employee.name[0]}
                            </div>
                        )}
                    </div>

                    <h1 className={`text-xl font-bold mb-1 tracking-tight ${isLightText ? "text-white" : "text-gray-900"}`}>
                        {employee.name}
                    </h1>
                    {employee.jobTitle && (
                        <p className={`text-sm font-medium ${isLightText ? "text-white/90" : "text-gray-600"}`}>{employee.jobTitle}</p>
                    )}
                    <p className={`text-xs font-normal mt-1 uppercase tracking-wide ${isLightText ? "text-white/70" : "text-gray-500"}`}>
                        {employee.company.name}
                    </p>
                    {/* Custom Fields */}
                    {employee.customFieldValues && employee.customFieldValues.length > 0 && (
                        <div className="mt-2 flex flex-wrap justify-center gap-2">
                            {employee.customFieldValues.map((cfv) => (
                                <span
                                    key={cfv.id}
                                    className={`text-xs px-2 py-1 rounded-full ${isLightText ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}
                                >
                                    {cfv.value}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons List */}
                <div className="w-full space-y-3 relative z-10 px-4">
                    {employee.whatsapp && (
                        <TrackedActionButton
                            href={`https://wa.me/${employee.whatsapp.replace(/[^0-9]/g, '')}`}
                            label="WhatsApp"
                            iconName="MessageCircle"
                            employeeId={employee.id}
                            buttonType="whatsapp"
                        />
                    )}

                    {employee.email && (
                        <TrackedActionButton
                            href={`mailto:${employee.email}`}
                            label="Email"
                            iconName="Mail"
                            employeeId={employee.id}
                            buttonType="email"
                        />
                    )}

                    {employee.website && (
                        <TrackedActionButton
                            href={employee.website}
                            label="Sitio web"
                            iconName="Globe"
                            employeeId={employee.id}
                            buttonType="website"
                        />
                    )}

                    {employee.instagram && (
                        <TrackedActionButton
                            href={employee.instagram}
                            label="Instagram"
                            iconName="Instagram"
                            employeeId={employee.id}
                            buttonType="instagram"
                        />
                    )}

                    {employee.linkedin && (
                        <TrackedActionButton
                            href={employee.linkedin}
                            label="LinkedIn"
                            iconName="Linkedin"
                            employeeId={employee.id}
                            buttonType="linkedin"
                        />
                    )}

                    {employee.phone && (
                        <TrackedActionButton
                            href={`tel:${employee.phone}`}
                            label="Teléfono"
                            iconName="Phone"
                            employeeId={employee.id}
                            buttonType="phone"
                        />
                    )}

                    {employee.googleReviews && (
                        <TrackedActionButton
                            href={employee.googleReviews}
                            label="Reseñas de Google"
                            iconName="Star"
                            employeeId={employee.id}
                            buttonType="googleReviews"
                        />
                    )}

                    <div className="pt-2">
                        <VCardButton employee={employee} />
                    </div>
                </div>

            </div>

            {/* Footer Logo */}
            <div className="w-full flex justify-center py-6 opacity-80 mt-auto">
                <Image
                    src="/powered-by-logo.png"
                    alt="Powered By Linkd"
                    width={120}
                    height={30}
                    className="object-contain"
                />
            </div>
        </main>
    );
}
