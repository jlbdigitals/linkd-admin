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

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
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

    const maxEmployees = parseInt(formData.get("maxEmployees") as string) || 5;
    const ownerEmail = formData.get("ownerEmail") as string;

    await prisma.company.create({
        data: {
            name,
            slug: `${slugify(name)}-${generateSlug(4)}`, // Ensure uniqueness
            logoUrl: logoUrl || "https://via.placeholder.com/150",
            maxEmployees,
            ownerEmail
        }
    });

    revalidatePath("/admin");
}

export async function softDeleteCompany(formData: FormData) {
    const id = formData.get("id") as string;
    await prisma.company.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
    revalidatePath("/admin");
    revalidatePath("/admin/trash");
}

export async function restoreCompany(formData: FormData) {
    const id = formData.get("id") as string;
    await prisma.company.update({
        where: { id },
        data: { deletedAt: null }
    });
    revalidatePath("/admin");
    revalidatePath("/admin/trash");
}

export async function permanentDeleteCompany(formData: FormData) {
    const id = formData.get("id") as string;
    await prisma.company.delete({
        where: { id }
    });
    revalidatePath("/admin/trash");
}

export async function createEmployee(formData: FormData) {
    const companyId = formData.get("companyId") as string;

    // Check employee limit
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
            _count: {
                select: { employees: true }
            }
        }
    });

    if (!company) {
        return { error: "Empresa no encontrada" };
    }

    if (company._count.employees >= company.maxEmployees) {
        return { error: `Límite de empleados (${company.maxEmployees}) alcanzado. Contacta al administrador.` };
    }

    // Continue with creation




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

    // Get employee with company for revalidation
    const employee = await prisma.employee.update({
        where: { id },
        data,
        include: { company: true }
    });

    const customFieldEntries = Array.from(formData.entries())
        .filter(([key]) => key.startsWith("customField_"))
        .map(([key, value]) => ({
            employeeId: id,
            customFieldId: key.replace("customField_", ""),
            value: value as string
        }))
        .filter(entry => entry.value.trim() !== "");

    // Use a transaction to ensure atomicity
    await prisma.$transaction([
        prisma.employeeCustomField.deleteMany({
            where: { employeeId: id }
        }),
        ...(customFieldEntries.length > 0
            ? [prisma.employeeCustomField.createMany({ data: customFieldEntries })]
            : [])
    ]);

    revalidatePath(`/admin/company/${companyId}`);
    // Revalidate the public landing page
    revalidatePath(`/${employee.company.slug}/${employee.slug}`);
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
    const ownerEmail = formData.get("ownerEmail") as string;

    await prisma.company.update({
        where: { id },
        data: {
            name,
            colorTop,
            colorBottom,
            gradientAngle: gradientAngle ? parseInt(gradientAngle) : 135,
            bgImageUrl,
            isLightText: formData.get("isLightText") === "true",
            ownerEmail
        }
    });

    revalidatePath(`/admin`);

    revalidatePath(`/admin/company/${id}`);
}

export async function updateCompanyLimit(formData: FormData) {
    const id = formData.get("id") as string;
    const maxEmployeesRaw = formData.get("maxEmployees") as string;

    if (!id || !maxEmployeesRaw) {
        console.error("Missing id or maxEmployees");
        return;
    }

    const maxEmployees = parseInt(maxEmployeesRaw);
    if (isNaN(maxEmployees)) {
        console.error("Invalid maxEmployees");
        return;
    }

    try {
        await prisma.company.update({
            where: { id },
            data: { maxEmployees }
        });
        revalidatePath("/admin");
    } catch (error) {
        console.error("Error updating limit:", error);
    }
}
