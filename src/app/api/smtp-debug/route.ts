import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const smtpPass = process.env.SMTP_PASS || '';

        const debug = {
            nodeEnv: process.env.NODE_ENV,
            smtp: {
                hasHost: !!process.env.SMTP_HOST,
                hasPort: !!process.env.SMTP_PORT,
                hasUser: !!process.env.SMTP_USER,
                hasPass: !!process.env.SMTP_PASS,
                hasFrom: !!process.env.SMTP_FROM,
                hasSecure: !!process.env.SMTP_SECURE,
                host: process.env.SMTP_HOST || 'NOT SET',
                port: process.env.SMTP_PORT || 'NOT SET',
                secure: process.env.SMTP_SECURE || 'NOT SET',
                user: process.env.SMTP_USER || 'NOT SET',
                from: process.env.SMTP_FROM || 'NOT SET',
                // Show password length and first/last chars for debugging
                passLength: smtpPass.length,
                passFirst3: smtpPass.substring(0, 3),
                passLast3: smtpPass.substring(smtpPass.length - 3),
                passHasSpaces: smtpPass.includes(' '),
                passHasQuotes: smtpPass.includes('"') || smtpPass.includes("'"),
            },
        };

        return NextResponse.json(debug);
    } catch (error) {
        return NextResponse.json(
            { error: String(error) },
            { status: 500 }
        );
    }
}
