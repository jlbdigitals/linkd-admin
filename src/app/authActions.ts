"use server";

import { prisma } from "@/lib/prisma";
import { login, logout as libLogout } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sendLoginCode } from "@/lib/email";

export async function logout() {
    await libLogout();
}

export async function requestLoginCode(formData: FormData) {
    const email = formData.get("email") as string;

    if (!email) {
        return { error: "Email is required" };
    }

    // Check if user is Super Admin
    const superAdmin = await prisma.superAdmin.findUnique({
        where: { email }
    });

    let employee = null;
    if (!superAdmin) {
        // Check if user exists and is admin (Company Admin)
        employee = await prisma.employee.findFirst({
            where: { email, isAdmin: true }
        });

        if (!employee) {
            // Check if user is an owner by email
            const company = await prisma.company.findFirst({
                where: { ownerEmail: email }
            });
            if (!company) {
                return { error: "Acceso denegado. Verifica que eres administrador." };
            }
        }
    }

    // Custom rule: jaime@digitals.cl is a Master User with a fixed password
    if (email === "jaime@digitals.cl") {
        return { success: true, email, isMaster: true };
    }

    // Generate 6 digit code
    let code = Math.floor(100000 + Math.random() * 900000).toString();

    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store token
    await prisma.verificationToken.upsert({
        where: {
            identifier_token: {
                identifier: email,
                token: code // This composite key logic in schema might be slightly off for "upsert by email", 
                // but schema is @@unique([identifier, token]).
                // We actually want one active token per email usually, or just store a new one.
                // Let's rely on deleteMany first to clean up old ones.
            }
        },
        // Actually, upsert needs a unique where. The schema @@unique([identifier, token]) allows multiple tokens for same email if tokens differ.
        // We want to Replace old tokens.
        update: {
            token: code,
            expires
        },
        create: {
            identifier: email,
            token: code,
            expires
        },
        // Wait, strictly speaking upsert requires a unique constraint match.
        // If I want to "overwrite" the active code for this email, I should maybe just delete old ones.
    });

    // Better approach: clean old tokens for this email
    await prisma.verificationToken.deleteMany({
        where: { identifier: email }
    });

    await prisma.verificationToken.create({
        data: {
            identifier: email,
            token: code,
            expires
        }
    });

    // Send Email
    const isDev = process.env.NODE_ENV === 'development';

    // Always log in development for easy testing
    if (isDev) {
        console.log(`\n========================================`);
        console.log(`LOGIN CODE FOR ${email}: ${code}`);
        console.log(`========================================\n`);
    }

    // Send email if SMTP is configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const emailResult = await sendLoginCode(email, code);
        if (!emailResult.success) {
            console.error('Failed to send email, but code is still valid');
        }
    } else {
        console.warn('SMTP not configured. Email not sent. Configure SMTP_USER and SMTP_PASS environment variables.');
    }

    return { success: true, email, debugCode: isDev ? code : undefined };
}

export async function verifyLoginCode(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const codeOrPass = formData.get("code") as string;

    if (!email || !codeOrPass) {
        return { error: "Faltan datos." };
    }

    // Master User Bypass
    if (email === "jaime@digitals.cl") {
        if (codeOrPass !== "e8l4de3.") {
            return { error: "Contraseña incorrecta." };
        }
        // Valid master login!
    } else {
        // Standard OTP verification
        const tokenRecord = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token: codeOrPass
            }
        });

        if (!tokenRecord) {
            return { error: "Código inválido." };
        }

        if (tokenRecord.expires < new Date()) {
            await prisma.verificationToken.delete({
                where: {
                    identifier_token: { identifier: email, token: codeOrPass }
                }
            });
            return { error: "El código ha expirado." };
        }

        // Valid! Clean up
        await prisma.verificationToken.deleteMany({
            where: { identifier: email }
        });
    }

    // Determine Role
    const superAdmin = await prisma.superAdmin.findUnique({ where: { email } });
    let role = "COMPANY_ADMIN";
    let companyId = null;

    if (superAdmin) {
        role = "SUPER_ADMIN";
    } else {
        const employee = await prisma.employee.findFirst({ where: { email, isAdmin: true } });
        if (employee) {
            companyId = employee.companyId;
        } else {
            const company = await prisma.company.findFirst({ where: { ownerEmail: email } });
            if (company) {
                companyId = company.id;
            }
        }
    }

    await login(email, role, companyId);

    if (role === "SUPER_ADMIN") {
        redirect("/admin");
    } else {
        redirect(`/admin/company/${companyId}`);
    }
}
