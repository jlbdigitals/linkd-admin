import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const config = {
            nodeEnv: process.env.NODE_ENV,
            hasDbUrl: !!process.env.DATABASE_URL,
            dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 15) || 'NOT SET',
            hasAuthSecret: !!process.env.AUTH_SECRET,
            smtp: {
                hasHost: !!process.env.SMTP_HOST,
                hasPort: !!process.env.SMTP_PORT,
                hasUser: !!process.env.SMTP_USER,
                hasPass: !!process.env.SMTP_PASS,
                hasFrom: !!process.env.SMTP_FROM,
                host: process.env.SMTP_HOST || 'NOT SET',
                port: process.env.SMTP_PORT || 'NOT SET',
                user: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 5)}***` : 'NOT SET',
                from: process.env.SMTP_FROM || 'NOT SET',
            },
        };

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json(
            { error: String(error) },
            { status: 500 }
        );
    }
}
