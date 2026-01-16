"use client";

import { UserPlus } from "lucide-react";

interface VCardButtonProps {
    employee: {
        name: string;
        jobTitle?: string | null;
        email?: string | null;
        phone?: string | null;
        whatsapp?: string | null;
        website?: string | null;
        instagram?: string | null;
        linkedin?: string | null;
        company: {
            name: string;
        };
    };
}

export function VCardButton({ employee }: VCardButtonProps) {
    const generateVCard = () => {
        // Construct vCard 3.0
        let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${employee.name}\nORG:${employee.company.name}\n`;

        if (employee.jobTitle) vcard += `TITLE:${employee.jobTitle}\n`;
        if (employee.email) vcard += `EMAIL:${employee.email}\n`;
        if (employee.phone) vcard += `TEL;TYPE=CELL:${employee.phone}\n`;
        if (employee.whatsapp) vcard += `TEL;TYPE=WHATSAPP:${employee.whatsapp}\n`;
        if (employee.website) vcard += `URL:${employee.website}\n`;
        if (employee.linkedin) vcard += `URL;type=LinkedIn:${employee.linkedin}\n`;
        if (employee.instagram) vcard += `URL;type=Instagram:${employee.instagram}\n`;

        vcard += `END:VCARD`;

        const blob = new Blob([vcard], { type: "text/vcard" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${employee.name.replace(/\s+/g, "_")}.vcf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={generateVCard}
            className="flex items-center w-full p-3 mb-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700 relative"
        >
            <span className="flex-1 text-center">Guardar contacto</span>
            <UserPlus size={18} className="absolute right-8 text-black" />
        </button>
    );
}
