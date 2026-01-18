"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Secure slug generator - 10 chars for ~839 quintillion combinations (anti-scraping)
function generateSlug(length = 10) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Helper to normalize website URLs
function normalizeUrl(url: string | null | undefined): string | null {
    if (!url || url.trim() === "") return null;
    const trimmed = url.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
    }
    return `https://${trimmed}`;
}

export async function createCompany(formData: FormData) {
    const name = formData.get("name") as string;
    const logoUrl = formData.get("logoUrl") as string;

    await prisma.company.create({
        data: {
            name,
            logoUrl: logoUrl || "https://via.placeholder.com/150",
        }
    });

    revalidatePath("/admin");
}

export async function createEmployee(formData: FormData) {
    const companyId = formData.get("companyId") as string;
    const name = formData.get("name") as string;
    const jobTitle = formData.get("jobTitle") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const whatsapp = formData.get("whatsapp") as string;
    const websiteRaw = formData.get("website") as string;
    const website = normalizeUrl(websiteRaw);
    const instagram = formData.get("instagram") as string;
    const linkedin = formData.get("linkedin") as string;
    const googleReviews = formData.get("googleReviews") as string;
    const uploadedPhotoUrl = formData.get("photoUrl") as string;
    const isAdmin = formData.get("isAdmin") === "true";

    // Use a random avatar seed based on name if no photo provided
    const photoUrl = uploadedPhotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, "")}`;

    // Create employee
    const employee = await prisma.employee.create({
        data: {
            slug: generateSlug(),
            companyId,
            name,
            jobTitle,
            email,
            phone,
            whatsapp,
            website,
            instagram,
            linkedin,
            googleReviews,
            photoUrl,
            isAdmin,
        }
    });

    // Handle custom field values
    const customFieldEntries = Array.from(formData.entries())
        .filter(([key]) => key.startsWith("customField_"))
        .map(([key, value]) => ({
            employeeId: employee.id,
            customFieldId: key.replace("customField_", ""),
            value: value as string
        }))
        .filter(entry => entry.value.trim() !== "");

    if (customFieldEntries.length > 0) {
        await prisma.employeeCustomField.createMany({
            data: customFieldEntries
        });
    }

    revalidatePath(`/admin/company/${companyId}`);
}

export async function updateEmployee(formData: FormData) {
    const id = formData.get("id") as string;
    const companyId = formData.get("companyId") as string;
    const name = formData.get("name") as string;
    const jobTitle = formData.get("jobTitle") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const whatsapp = formData.get("whatsapp") as string;
    const websiteRaw = formData.get("website") as string;
    const website = normalizeUrl(websiteRaw);
    const instagram = formData.get("instagram") as string;
    const linkedin = formData.get("linkedin") as string;
    const googleReviews = formData.get("googleReviews") as string;

    const uploadedPhotoUrl = formData.get("photoUrl") as string;
    const isAdmin = formData.get("isAdmin") === "true";

    const data: any = {
        name,
        jobTitle,
        email,
        phone,
        whatsapp,
        website,
        instagram,
        linkedin,
        googleReviews,
        isAdmin,
    };

    if (uploadedPhotoUrl) {
        data.photoUrl = uploadedPhotoUrl;
    }

    await prisma.employee.update({
        where: { id },
        data
    });

    // Handle custom field values - delete old ones and create new ones
    await prisma.employeeCustomField.deleteMany({
        where: { employeeId: id }
    });

    const customFieldEntries = Array.from(formData.entries())
        .filter(([key]) => key.startsWith("customField_"))
        .map(([key, value]) => ({
            employeeId: id,
            customFieldId: key.replace("customField_", ""),
            value: value as string
        }))
        .filter(entry => entry.value.trim() !== "");

    if (customFieldEntries.length > 0) {
        await prisma.employeeCustomField.createMany({
            data: customFieldEntries
        });
    }

    revalidatePath(`/admin/company/${companyId}`);
}

export async function deleteEmployee(formData: FormData) {
    const id = formData.get("id") as string;
    const companyId = formData.get("companyId") as string;

    await prisma.employee.delete({
        where: { id }
    });

    revalidatePath(`/admin/company/${companyId}`);
}

export async function updateCompany(formData: FormData) {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const colorTop = formData.get("colorTop") as string;
    const colorBottom = formData.get("colorBottom") as string;
    const gradientAngle = formData.get("gradientAngle") as string;
    const bgImageUrl = formData.get("bgImageUrl") as string;

    await prisma.company.update({
        where: { id },
        data: {
            name,
            colorTop,
            colorBottom,
            gradientAngle: gradientAngle ? parseInt(gradientAngle) : 135,
            bgImageUrl
        }
    });

    revalidatePath(`/admin`);
    revalidatePath(`/admin/company/${id}`);
}
