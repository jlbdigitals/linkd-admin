import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ENDPOINT TEMPORAL - ELIMINAR DESPUÉS DE USAR
// Lote final de la migración: crea/actualiza Companies y Employees, y
// permite mover un Employee existente a otra Company (caso Decoflat).

type CompanyIn = {
    slug: string; name: string;
    colorTop?: string; colorBottom?: string; gradientAngle?: number;
    isLightText?: boolean; maxEmployees?: number;
};
type EmployeeIn = {
    slug: string; name: string; companySlug: string;
    jobTitle?: string | null; photoUrl?: string | null;
    whatsapp?: string | null; phone?: string | null; email?: string | null;
    website?: string | null; instagram?: string | null; linkedin?: string | null;
};
type MoveIn = { employeeSlug: string; toCompanySlug: string };

export async function POST(request: NextRequest) {
    try {
        const { secret, companies, employees, moves } = await request.json();
        const IMPORT_SECRET = process.env.IMPORT_SECRET;
        if (!IMPORT_SECRET || secret !== IMPORT_SECRET) {
            return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
        }

        const companyIds: Record<string, string> = {};
        for (const c of (companies || []) as CompanyIn[]) {
            const rec = await prisma.company.upsert({
                where: { slug: c.slug },
                update: {
                    colorTop: c.colorTop, colorBottom: c.colorBottom,
                    gradientAngle: c.gradientAngle ?? 180,
                    isLightText: Boolean(c.isLightText),
                },
                create: {
                    name: c.name, slug: c.slug,
                    colorTop: c.colorTop, colorBottom: c.colorBottom,
                    gradientAngle: c.gradientAngle ?? 180,
                    isLightText: Boolean(c.isLightText),
                    maxEmployees: c.maxEmployees ?? 15,
                },
            });
            companyIds[c.slug] = rec.id;
        }

        const upserted: string[] = [];
        for (const e of (employees || []) as EmployeeIn[]) {
            let companyId = companyIds[e.companySlug];
            if (!companyId) {
                const c = await prisma.company.findUnique({ where: { slug: e.companySlug } });
                if (!c) return NextResponse.json({ error: `Company '${e.companySlug}' not found` }, { status: 400 });
                companyId = c.id;
            }
            const data = {
                name: e.name, jobTitle: e.jobTitle || null, photoUrl: e.photoUrl || null,
                whatsapp: e.whatsapp || null, phone: e.phone || null, email: e.email || null,
                website: e.website || null, instagram: e.instagram || null, linkedin: e.linkedin || null,
                companyId,
            };
            await prisma.employee.upsert({
                where: { slug: e.slug },
                update: data,
                create: { slug: e.slug, ...data },
            });
            upserted.push(e.slug);
        }

        const moved: string[] = [];
        for (const m of (moves || []) as MoveIn[]) {
            const c = await prisma.company.findUnique({ where: { slug: m.toCompanySlug } });
            if (!c) return NextResponse.json({ error: `Company '${m.toCompanySlug}' not found` }, { status: 400 });
            const r = await prisma.employee.updateMany({
                where: { slug: m.employeeSlug },
                data: { companyId: c.id },
            });
            if (r.count > 0) moved.push(m.employeeSlug);
        }

        return NextResponse.json({ success: true, companies: Object.keys(companyIds), employees: upserted, moved });
    } catch (error) {
        console.error('Error in migrate-batch-once:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
