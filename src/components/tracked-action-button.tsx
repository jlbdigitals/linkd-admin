"use client";

import { recordInteraction } from "@/app/analyticsActions";
import {
    Globe,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    MessageCircle,
    Star,
    LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
    MessageCircle,
    Mail,
    Globe,
    Instagram,
    Linkedin,
    Phone,
    Star,
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

    const Icon = iconMap[iconName] || Globe;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="flex items-center w-full p-3 mb-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700 relative"
        >
            <span className="flex-1 text-center">{label}</span>
            <Icon size={18} className="absolute right-8 text-black" />
        </a>
    );
}
