
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create Galactic Gourmet Company
    const company = await prisma.company.upsert({
        where: { id: 'galactic-gourmet-id' }, // constant ID for repeatability
        update: {},
        create: {
            id: 'galactic-gourmet-id',
            name: 'Galactic Gourmet',
            slug: 'galactic-gourmet',
            // Cosmic gradient
            colorTop: '#1a1a2e',
            colorBottom: '#16213e',
            gradientAngle: 160,
            bgImageUrl: '/bg-user.png',
            // No logo for now, or placeholder
            logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Galactic',
        }
    });

    console.log(`Created/Found company: ${company.name}`);

    // 2. Create Custom Fields
    const planetField = await prisma.customField.create({
        data: {
            companyId: company.id,
            label: 'Planeta de Origen',
            icon: 'Globe',
            placeholder: 'ej: Marte',
        }
    });

    // 3. Employees Data
    const employeesData = [
        {
            name: 'Zara Moon',
            slug: 'zarama',
            jobTitle: 'Cosmic Chef',
            email: 'zara@galactic.com',
            whatsapp: '+56911111111',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zara',
            customFieldValue: 'Marte'
        },
        {
            name: 'Orion Star',
            slug: 'orionst',
            jobTitle: 'Stellar Sommelier',
            email: 'orion@galactic.com',
            instagram: 'https://instagram.com/orion_stellar',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Orion',
        },
        {
            name: 'Nova Nebula',
            slug: 'novane',
            jobTitle: 'Galaxy Guide',
            email: 'nova@galactic.com',
            linkedin: 'https://linkedin.com/in/novanebula',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nova',
        },
        {
            name: 'Cosmo Comet',
            slug: 'cosmoco',
            jobTitle: 'Astro Architect',
            email: 'cosmo@galactic.com',
            website: 'https://cosmic-structures.space',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cosmo',
        },
        {
            name: 'Lyra Light',
            slug: 'lyrali',
            jobTitle: 'Photon Photographer',
            email: 'lyra@galactic.com',
            googleReviews: 'https://g.page/galactic-gourmet',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lyra',
        }
    ];

    for (const empData of employeesData) {
        // Upsert employee
        const employee = await prisma.employee.upsert({
            where: { slug: empData.slug },
            update: {},
            create: {
                companyId: company.id,
                name: empData.name,
                slug: empData.slug,
                jobTitle: empData.jobTitle,
                email: empData.email,
                whatsapp: empData.whatsapp,
                instagram: empData.instagram,
                linkedin: empData.linkedin,
                website: empData.website,
                googleReviews: empData.googleReviews,
                photoUrl: empData.photoUrl,
            }
        });

        console.log(`Upserted employee: ${employee.name}`);

        // Add custom field if applicable
        if (empData.customFieldValue) {
            await prisma.employeeCustomField.create({
                data: {
                    employeeId: employee.id,
                    customFieldId: planetField.id,
                    value: empData.customFieldValue
                }
            }).catch(() => { }); // Ignore if exists
        }

        // 4. Generate Fake Analytics (ClickLogs)
        // Generate between 50 and 200 interactions per employee
        const interactionCount = Math.floor(Math.random() * 150) + 50;
        const buttonTypes = ['whatsapp', 'email', 'website', 'instagram', 'linkedin', 'googleReviews', 'phone'].filter(type => {
            // Only include buttons relevant to the employee (simple logic or just random)
            // For simplicity, just pick random ones, assuming they might have clicked anything if it existed
            // But better to align with their data.
            if (type === 'whatsapp' && !empData.whatsapp) return false;
            if (type === 'email' && !empData.email) return false;
            if (type === 'website' && !empData.website) return false;
            if (type === 'instagram' && !empData.instagram) return false;
            if (type === 'linkedin' && !empData.linkedin) return false;
            if (type === 'googleReviews' && !empData.googleReviews) return false;
            // phone is generic, let's skip
            return true;
        });

        const clicks = [];
        for (let i = 0; i < interactionCount; i++) {
            const isView = Math.random() > 0.4; // 60% views, 40% clicks
            const interactionType = isView ? 'VIEW' : 'CLICK';
            let buttonType = null;

            if (interactionType === 'CLICK' && buttonTypes.length > 0) {
                buttonType = buttonTypes[Math.floor(Math.random() * buttonTypes.length)];
            }

            // Random date within last 30 days
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

            clicks.push({
                employeeId: employee.id,
                interactionType,
                buttonType,
                createdAt: date
            });
        }

        // Batch insert clicks
        // SQLite might have limits on variables, so we do it in chunks if huge, 
        // but 200 items is fine.
        if (clicks.length > 0) {
            await prisma.clickLog.createMany({
                data: clicks
            });
        }
        console.log(`Generated ${clicks.length} interactions for ${employee.name}`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
