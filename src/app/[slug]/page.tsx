import { Button } from "@/components/ui/button";
import { VCardButton } from "@/components/vcard-button";
import { prisma } from "@/lib/prisma";

import Image from "next/image";
import { notFound } from "next/navigation";
import { recordInteraction } from "@/app/analyticsActions";
import { TrackedActionButton } from "@/components/tracked-action-button";



export default async function ProfilePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const employee = await prisma.employee.findUnique({
        where: { slug },
        include: {
            company: true,
        },
    });

    if (!employee) {
        notFound();
    }

    // Record profile view
    await recordInteraction(employee.id, "VIEW");

    return (
        <main className="min-h-screen flex flex-col items-center justify-between p-4 pt-[50px]"
            style={{
                background: `linear-gradient(${employee.company.gradientAngle || 135}deg, ${employee.company.colorTop || "#ffffff"} 0%, ${employee.company.colorBottom || "#a1a1aa"} 100%)`,
            }}
        >
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

                    <h1 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">
                        {employee.name}
                    </h1>
                    {employee.jobTitle && (
                        <p className="text-sm font-medium text-gray-600">{employee.jobTitle}</p>
                    )}
                    <p className="text-xs font-normal text-gray-500 mt-1 uppercase tracking-wide">
                        {employee.company.name}
                    </p>
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
