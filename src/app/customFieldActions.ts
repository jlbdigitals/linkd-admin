"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCustomField(formData: FormData) {
    const companyId = formData.get("companyId") as string;
    const label = formData.get("label") as string;
    const icon = formData.get("icon") as string;
    const placeholder = formData.get("placeholder") as string;

    // Get current max order
    const maxOrder = await prisma.customField.findFirst({
        where: { companyId },
        orderBy: { order: "desc" },
        select: { order: true }
    });

    await prisma.customField.create({
        data: {
            companyId,
            label,
            icon,
            placeholder: placeholder || null,
            order: (maxOrder?.order ?? -1) + 1
        }
    });

    revalidatePath(`/admin/company/${companyId}`);
}

export async function deleteCustomField(formData: FormData) {
    const id = formData.get("id") as string;
    const companyId = formData.get("companyId") as string;

    await prisma.customField.delete({
        where: { id }
    });

    revalidatePath(`/admin/company/${companyId}`);
}

export async function updateFieldVisibility(formData: FormData) {
    const companyId = formData.get("companyId") as string;
    const field = formData.get("field") as string;
    const visible = formData.get("visible") === "true";

    const fieldMap: Record<string, string> = {
        whatsapp: "showWhatsapp",
        email: "showEmail",
        phone: "showPhone",
        website: "showWebsite",
        instagram: "showInstagram",
        linkedin: "showLinkedin",
        googleReviews: "showGoogleReviews"
    };

    const dbField = fieldMap[field];
    if (!dbField) return;

    await prisma.companyFieldVisibility.upsert({
        where: { companyId },
        create: {
            companyId,
            [dbField]: visible
        },
        update: {
            [dbField]: visible
        }
    });

    revalidatePath(`/admin/company/${companyId}`);
}
