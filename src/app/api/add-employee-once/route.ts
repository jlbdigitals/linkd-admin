import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ENDPOINT TEMPORAL - ELIMINAR DESPUÉS DE USAR
// Crea (o actualiza) una Company + un Employee a partir del body del POST.
// Pensado para altas puntuales que no vinieron en el import masivo del WP viejo
// (paginas armadas con Elementor por fuera del sistema de CPTs de tarjetas).

export async function POST(request: NextRequest) {
    try {
        const { secret, company, employee } = await request.json();
        const IMPORT_SECRET = process.env.IMPORT_SECRET;
        if (!IMPORT_SECRET || secret !== IMPORT_SECRET) {
            return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
        }
        if (!company?.slug || !company?.name || !employee?.slug || !employee?.name) {
            return NextResponse.json({ error: 'Missing company/employee fields' }, { status: 400 });
        }

        const companyRecord = await prisma.company.upsert({
            where: { slug: company.slug },
            update: {},
            create: {
                name: company.name,
                slug: company.slug,
                colorTop: company.colorTop || '#0f172a',
                colorBottom: company.colorBottom || '#334155',
                gradientAngle: 135,
                maxEmployees: company.maxEmployees || 10,
            },
        });

        const employeeRecord = await prisma.employee.upsert({
            where: { slug: employee.slug },
            update: {
                name: employee.name,
                jobTitle: employee.jobTitle || null,
                photoUrl: employee.photoUrl || null,
                whatsapp: employee.whatsapp || null,
                phone: employee.phone || null,
                email: employee.email || null,
                website: employee.website || null,
                instagram: employee.instagram || null,
                linkedin: employee.linkedin || null,
                companyId: companyRecord.id,
            },
            create: {
                slug: employee.slug,
                name: employee.name,
                jobTitle: employee.jobTitle || null,
                photoUrl: employee.photoUrl || null,
                whatsapp: employee.whatsapp || null,
                phone: employee.phone || null,
                email: employee.email || null,
                website: employee.website || null,
                instagram: employee.instagram || null,
                linkedin: employee.linkedin || null,
                companyId: companyRecord.id,
            },
        });

        return NextResponse.json({ success: true, company: companyRecord.slug, employee: employeeRecord.slug });
    } catch (error) {
        console.error('Error in add-employee-once:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
