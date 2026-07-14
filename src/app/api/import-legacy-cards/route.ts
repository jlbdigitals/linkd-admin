import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ENDPOINT TEMPORAL - ELIMINAR DESPUÉS DE USAR
// Importa las tarjetas del WordPress viejo (linkd.cl) a esta BD.
// Cada CPT de WP se mapea 1:1 a una Company nueva (decision: mantener
// agrupacion por CPT original, no por companyLabel del cliente final).
// El JSON de origen (backups/cards_export.json) se manda en el body del
// POST -- a proposito NO vive en este repo, para no comitear PII.

const IMPORT_SECRET = process.env.IMPORT_SECRET;

type LegacyEmployee = {
    slug: string;
    name: string;
    jobTitle: string | null;
    companyLabel: string | null;
    whatsapp: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    instagram: string | null;
    linkedin: string | null;
    photoUrl: string | null;
    wpPostId: string | null;
    oldUrl: string | null;
};

const COMPANY_META: Record<string, { name: string; slug: string; colorTop: string; colorBottom: string }> = {
    'tarjetas-linkd': { name: 'Tarjetas LinkD (test)', slug: 'tarjetas-linkd', colorTop: '#0f172a', colorBottom: '#1e293b' },
    'tarjetas-khipu': { name: 'Khipu', slug: 'khipu', colorTop: '#5b21b6', colorBottom: '#1e1b4b' },
    'tarjetas-integrakin': { name: 'Integrakin', slug: 'integrakin', colorTop: '#065f46', colorBottom: '#022c22' },
    'turia': { name: 'Clínica Turia', slug: 'turia', colorTop: '#0e7490', colorBottom: '#164e63' },
    'tarjetas-malcriado': { name: 'The Branican Company', slug: 'the-branican-company', colorTop: '#7c2d12', colorBottom: '#451a03' },
    'tarjetas-solarsol': { name: 'Solarsol', slug: 'solarsol', colorTop: '#b45309', colorBottom: '#78350f' },
    'expert_pro': { name: 'Expert Pro', slug: 'expert-pro', colorTop: '#1d4ed8', colorBottom: '#1e3a8a' },
    'etmday': { name: 'ETM Day', slug: 'etmday', colorTop: '#be123c', colorBottom: '#4c0519' },
    'linkd': { name: 'LinkD', slug: 'linkd', colorTop: '#0f172a', colorBottom: '#334155' },
    'emprendetube': { name: 'Emprendetube', slug: 'emprendetube', colorTop: '#166534', colorBottom: '#052e16' },
};

function stripPrefix(value: string, prefix: string): string {
    const v = value.trim();
    return v.toLowerCase().startsWith(prefix) ? v.slice(prefix.length).trim() : v;
}

function normalizeWhatsapp(raw: string | null): string | null {
    if (!raw) return null;
    const digits = raw.replace(/[^0-9]/g, '');
    return digits || null;
}

function normalizePhone(raw: string | null): string | null {
    if (!raw) return null;
    let v = stripPrefix(raw, 'tel:').replace(/±/g, '+');
    v = v.replace(/[^0-9+]/g, '');
    return v || null;
}

function normalizeEmail(raw: string | null): string | null {
    if (!raw) return null;
    const v = stripPrefix(raw, 'mailto:');
    return v.includes('@') ? v : null;
}

function normalizeUrl(raw: string | null): string | null {
    if (!raw) return null;
    let v = raw.trim();
    v = v.replace(/^(https?):?\/\//i, '$1://');
    if (/^https?:\/\//i.test(v)) return v;
    if (!/\s/.test(v) && /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(v)) {
        return `https://${v}`;
    }
    return null;
}

function normalizeInstagram(raw: string | null): string | null {
    if (!raw) return null;
    const v = raw.trim();
    const m = v.match(/instagram\.com\/([A-Za-z0-9_.]+)/i);
    if (m) return `https://www.instagram.com/${m[1]}`;
    if (/^https?:\/\//i.test(v)) return v;
    const handle = v.replace(/^@/, '');
    if (/^[A-Za-z0-9_.]+$/.test(handle)) return `https://www.instagram.com/${handle}`;
    return null;
}

function normalizeLinkedin(raw: string | null): string | null {
    if (!raw) return null;
    const v = raw.trim();
    if (/^https?:\/\//i.test(v)) return v;
    if (/^www\.linkedin\.com\//i.test(v)) return `https://${v}`;
    if (/^linkedin\.com\//i.test(v)) return `https://${v}`;
    return null;
}

export async function POST(request: NextRequest) {
    try {
        const { secret, companies: rawCompanies } = await request.json();
        if (!IMPORT_SECRET || secret !== IMPORT_SECRET) {
            return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
        }
        if (!rawCompanies || typeof rawCompanies !== 'object') {
            return NextResponse.json({ error: "Missing 'companies' in body" }, { status: 400 });
        }

        const companies = rawCompanies as Record<string, { employees: LegacyEmployee[] }>;

        const usedSlugs = new Set<string>();
        const plan: Array<{ cptSlug: string; employee: LegacyEmployee; finalSlug: string }> = [];

        for (const [cptSlug, data] of Object.entries(companies)) {
            const meta = COMPANY_META[cptSlug];
            if (!meta) throw new Error(`Sin mapeo de Company para CPT '${cptSlug}'`);

            for (const emp of data.employees || []) {
                let candidate = (emp.slug || '').toLowerCase().trim();
                const isNumericOnly = /^[0-9]+$/.test(candidate);

                if (!candidate || isNumericOnly || usedSlugs.has(candidate)) {
                    candidate = `${meta.slug}-${emp.slug}`;
                }
                let unique = candidate;
                let n = 2;
                while (usedSlugs.has(unique)) {
                    unique = `${candidate}-${n}`;
                    n += 1;
                }
                usedSlugs.add(unique);

                plan.push({ cptSlug, employee: emp, finalSlug: unique });
            }
        }

        const droppedFields: string[] = [];
        const companyIdByCpt: Record<string, string> = {};

        for (const [cptSlug, meta] of Object.entries(COMPANY_META)) {
            const countForCompany = plan.filter((p) => p.cptSlug === cptSlug).length;
            const company = await prisma.company.upsert({
                where: { slug: meta.slug },
                update: {},
                create: {
                    name: meta.name,
                    slug: meta.slug,
                    colorTop: meta.colorTop,
                    colorBottom: meta.colorBottom,
                    gradientAngle: 135,
                    maxEmployees: countForCompany + 10,
                },
            });
            companyIdByCpt[cptSlug] = company.id;
        }

        let employeesUpserted = 0;
        for (const item of plan) {
            const emp = item.employee;
            const whatsapp = normalizeWhatsapp(emp.whatsapp);
            const phone = normalizePhone(emp.phone);
            const email = normalizeEmail(emp.email);
            const website = normalizeUrl(emp.website);
            const instagram = normalizeInstagram(emp.instagram);
            const linkedin = normalizeLinkedin(emp.linkedin);

            if (emp.website && !website) droppedFields.push(`website (${emp.wpPostId}): "${emp.website}"`);
            if (emp.linkedin && !linkedin) droppedFields.push(`linkedin (${emp.wpPostId}): "${emp.linkedin}"`);
            if (emp.instagram && !instagram) droppedFields.push(`instagram (${emp.wpPostId}): "${emp.instagram}"`);

            await prisma.employee.upsert({
                where: { slug: item.finalSlug },
                update: {
                    name: emp.name || '(sin nombre)',
                    jobTitle: emp.jobTitle || null,
                    photoUrl: emp.photoUrl || null,
                    whatsapp,
                    phone,
                    email,
                    website,
                    instagram,
                    linkedin,
                    companyId: companyIdByCpt[item.cptSlug],
                },
                create: {
                    slug: item.finalSlug,
                    name: emp.name || '(sin nombre)',
                    jobTitle: emp.jobTitle || null,
                    photoUrl: emp.photoUrl || null,
                    whatsapp,
                    phone,
                    email,
                    website,
                    instagram,
                    linkedin,
                    companyId: companyIdByCpt[item.cptSlug],
                },
            });
            employeesUpserted += 1;
        }

        return NextResponse.json({
            success: true,
            companiesUpserted: Object.keys(COMPANY_META).length,
            employeesUpserted,
            droppedFields,
        });
    } catch (error) {
        console.error('Error importing legacy cards:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
