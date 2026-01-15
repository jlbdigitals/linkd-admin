import { Button } from "@/components/ui/button";
import { VCardButton } from "@/components/vcard-button";
import { prisma } from "@/lib/prisma";
import {
    Globe,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    MessageCircle,
    Star
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

// Helper for action buttons
function ActionButton({
    href,
    label,
    icon: Icon
}: {
    href: string;
    label: string;
    icon: any
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full p-3 mb-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700"
        >
            <span className="flex-1 text-center">{label}</span>
            <Icon size={18} className="absolute right-8 text-black" />
        </a>
    );
}

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

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4"
            style={{
                background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)", // White to silver gradient like image
            }}
        >
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

                    <h1 className="text-xl font-bold text-gray-900 mb-1 tracking-tight uppercase">
                        {employee.company.name}
                    </h1>
                    <p className="text-sm font-medium text-gray-600 mb-6">
                        {employee.name}
                        {employee.jobTitle && <span className="block text-xs font-normal text-gray-500 mt-1">{employee.jobTitle}</span>}
                    </p>
                </div>

                {/* Action Buttons List */}
                <div className="w-full space-y-3 relative z-10 px-4">
                    {employee.whatsapp && (
                        <ActionButton
                            href={`https://wa.me/${employee.whatsapp.replace(/[^0-9]/g, '')}`}
                            label="WhatsApp"
                            icon={MessageCircle}
                        />
                    )}

                    {employee.email && (
                        <ActionButton
                            href={`mailto:${employee.email}`}
                            label="Email"
                            icon={Mail}
                        />
                    )}

                    {employee.website && (
                        <ActionButton
                            href={employee.website}
                            label="Sitio web"
                            icon={Globe}
                        />
                    )}

                    {employee.instagram && (
                        <ActionButton
                            href={employee.instagram}
                            label="Instagram"
                            icon={Instagram}
                        />
                    )}

                    {employee.linkedin && (
                        <ActionButton
                            href={employee.linkedin}
                            label="LinkedIn"
                            icon={Linkedin}
                        />
                    )}

                    {employee.phone && (
                        <ActionButton
                            href={`tel:${employee.phone}`}
                            label="Teléfono"
                            icon={Phone}
                        />
                    )}

                    {employee.googleReviews && (
                        <ActionButton
                            href={employee.googleReviews}
                            label="Google Reviews"
                            icon={Star}
                        />
                    )}

                    <div className="pt-2">
                        <VCardButton employee={employee} />
                    </div>
                </div>

            </div>
        </main>
    );
}
