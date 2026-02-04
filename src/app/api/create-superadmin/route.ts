import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ENDPOINT TEMPORAL - ELIMINAR DESPUÉS DE USAR
export async function POST(request: NextRequest) {
    try {
        const { email, secret } = await request.json();

        // Verificar secret (cambia esto por algo seguro)
        if (secret !== 'temp-secret-123') {
            return NextResponse.json(
                { error: 'Invalid secret' },
                { status: 401 }
            );
        }

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Crear SuperAdmin
        const superAdmin = await prisma.superAdmin.upsert({
            where: { email },
            update: {},
            create: { email },
        });

        return NextResponse.json({
            success: true,
            message: `SuperAdmin created/updated: ${email}`,
            superAdmin,
        });
    } catch (error) {
        console.error('Error creating SuperAdmin:', error);
        return NextResponse.json(
            { error: String(error) },
            { status: 500 }
        );
    }
}
