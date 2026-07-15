import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ENDPOINT TEMPORAL - ELIMINAR DESPUÉS DE USAR
// Aplica el look & feel real de las tarjetas del WP viejo (gradientes
// extraidos de los templates Elementor/JetEngine) a las Companies.

export async function POST(request: NextRequest) {
    try {
        const { secret, companies } = await request.json();
        const IMPORT_SECRET = process.env.IMPORT_SECRET;
        if (!IMPORT_SECRET || secret !== IMPORT_SECRET) {
            return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
        }
        if (!Array.isArray(companies)) {
            return NextResponse.json({ error: "Missing 'companies' array" }, { status: 400 });
        }

        const updated: string[] = [];
        const notFound: string[] = [];
        for (const c of companies) {
            const result = await prisma.company.updateMany({
                where: { slug: c.slug },
                data: {
                    colorTop: c.colorTop,
                    colorBottom: c.colorBottom,
                    gradientAngle: c.gradientAngle ?? 180,
                    isLightText: Boolean(c.isLightText),
                },
            });
            (result.count > 0 ? updated : notFound).push(c.slug);
        }

        return NextResponse.json({ success: true, updated, notFound });
    } catch (error) {
        console.error('Error in update-branding-once:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
