"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Simple slug generator helper
function generateSlug(length = 5) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
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
    const website = formData.get("website") as string;
    const instagram = formData.get("instagram") as string;
    const linkedin = formData.get("linkedin") as string;
    const googleReviews = formData.get("googleReviews") as string;

    // Use a random avatar seed based on name if no photo provided
    // In a real app, this would be a file upload
    const photoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, "")}`;

    await prisma.employee.create({
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
        }
    });

    revalidatePath(`/admin/company/${companyId}`);
}
