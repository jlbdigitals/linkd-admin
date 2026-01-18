"use client";

import { recordInteraction } from "@/app/analyticsActions";
import {
    FaGlobe,
    FaInstagram,
    FaLinkedin,
    FaEnvelope,
    FaPhone,
    FaWhatsapp,
    FaGoogle
} from "react-icons/fa";
import { IconType } from "react-icons";

const iconMap: Record<string, IconType> = {
    MessageCircle: FaWhatsapp, // Mapping old name to new icon for compatibility
    Whatsapp: FaWhatsapp,
    Mail: FaEnvelope,
    Email: FaEnvelope,
    Globe: FaGlobe,
    Website: FaGlobe,
    Instagram: FaInstagram,
    Linkedin: FaLinkedin,
    Phone: FaPhone,
    Star: FaGoogle, // Mapping Star (Google Reviews) to Google icon
    Google: FaGoogle,
};

interface TrackedActionButtonProps {
    href: string;
    label: string;
    iconName: string;
    employeeId: string;
    buttonType: string;
}

export function TrackedActionButton({ href, label, iconName, employeeId, buttonType }: TrackedActionButtonProps) {
    const handleClick = () => {
        recordInteraction(employeeId, "CLICK", buttonType);
    };

    const Icon = iconMap[iconName] || FaGlobe;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="flex items-center w-full p-3 mb-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700 relative"
        >
            <span className="flex-1 text-center">{label}</span>
            <Icon size={20} className="absolute right-8 text-gray-700 group-hover:text-black transition-colors" />
        </a>
    );
}
