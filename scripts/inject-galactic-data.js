const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Starting injection for Galactic Gourmet...");

    // 1. Find or Create Company
    let company = await prisma.company.findFirst({
        where: { name: { contains: "Galactic Gourmet" } }
    });

    if (!company) {
        console.log("Creating Galactic Gourmet...");
        company = await prisma.company.create({
            data: {
                name: "Galactic Gourmet",
                maxEmployees: 15
            }
        });
    } else {
        console.log(`Found Galactic Gourmet (ID: ${company.id})`);
    }

    // 2. Update Company Details (Space Theme)
    await prisma.company.update({
        where: { id: company.id },
        data: {
            colorTop: "#4c1d95", // Violet 900
            colorBottom: "#db2777", // Pink 600
            gradientAngle: 160,
            maxEmployees: 15, // Increase limit
            fieldVisibility: {
                upsert: {
                    create: {
                        showWhatsapp: true,
                        showEmail: true,
                        showPhone: true,
                        showWebsite: true,
                        showInstagram: true,
                        showLinkedin: true,
                        showGoogleReviews: true
                    },
                    update: {
                        showWhatsapp: true,
                        showEmail: true,
                        showPhone: true,
                        showWebsite: true,
                        showInstagram: true,
                        showLinkedin: true,
                        showGoogleReviews: true
                    }
                }
            }
        }
    });

    // 3. Create Custom Fields
    // We need to check if they exist or just create them. Create usually fails if duplicate but we don't have unique constraint on label+companyId so it might duplicate.
    // Best to upsert/find first.
    let dishField = await prisma.customField.findFirst({ where: { companyId: company.id, label: "Plato Especialidad" } });
    if (!dishField) {
        dishField = await prisma.customField.create({
            data: {
                companyId: company.id,
                label: "Plato Especialidad",
                icon: "Utensils",
                placeholder: "Ej. Nebula Noodles",
                order: 0
            }
        });
    }

    let planetField = await prisma.customField.findFirst({ where: { companyId: company.id, label: "Planeta de Origen" } });
    if (!planetField) {
        planetField = await prisma.customField.create({
            data: {
                companyId: company.id,
                label: "Planeta de Origen",
                icon: "Globe",
                placeholder: "Ej. Mars",
                order: 1
            }
        });
    }

    // 4. Upsert Employees (Ensure ALL fields are filled)
    // ui-avatars.com needs to be in next.config.ts images/remotePatterns
    const employeesData = [
        {
            name: "Zara Moon",
            slug: "zara-moon",
            jobTitle: "Cosmic Executive Chef",
            email: "zara@galactic.com",
            whatsapp: "56912345678",
            phone: "+1 555-0101",
            instagram: "zara.moon.chef",
            linkedin: "https://linkedin.com/in/zaramoon",
            website: "https://zaramoon.space",
            googleReviews: "https://g.page/reviews/zara-moon",
            customFields: [
                { fieldId: dishField.id, value: "Quantum Quiche" },
                { fieldId: planetField.id, value: "Moon Base Alpha" }
            ]
        },
        {
            name: "Orion Star",
            slug: "orion-star",
            jobTitle: "Stellar Sommelier",
            email: "orion@galactic.com",
            whatsapp: "56987654321",
            phone: "+1 555-0102",
            instagram: "orion_vines",
            linkedin: "https://linkedin.com/in/orionstar",
            website: "https://nebula-wines.com",
            googleReviews: "https://g.page/reviews/orion-star",
            customFields: [
                { fieldId: dishField.id, value: "Nebula Nectar Pairing" },
                { fieldId: planetField.id, value: "Proxima Centauri b" }
            ]
        },
        {
            name: "Nova Nebula",
            slug: "nova-nebula",
            jobTitle: "Event Manager",
            email: "nova@galactic.com",
            whatsapp: "56911223344",
            phone: "+1 555-0103",
            instagram: "nova.events",
            linkedin: "https://linkedin.com/in/novanebula",
            website: "https://galactic-events.com",
            googleReviews: "https://g.page/reviews/nova-nebula",
            customFields: [
                { fieldId: dishField.id, value: "Black Hole Banquet" },
                { fieldId: planetField.id, value: "Kepler-186f" }
            ]
        }
    ];

    for (const emp of employeesData) {
        const existing = await prisma.employee.findUnique({
            where: { slug: emp.slug }
        });

        let employeeId = existing?.id;

        const data = {
            name: emp.name,
            slug: emp.slug, // only for create, updated below if create
            jobTitle: emp.jobTitle,
            photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random&size=200`,
            email: emp.email,
            whatsapp: emp.whatsapp,
            phone: emp.phone,
            instagram: emp.instagram,
            linkedin: emp.linkedin,
            website: emp.website,
            googleReviews: emp.googleReviews,
            companyId: company.id
        };

        if (existing) {
            console.log(`Updating ${emp.name}...`);
            await prisma.employee.update({
                where: { id: existing.id },
                data: {
                    ...data,
                    slug: undefined // don't update slug if not needed, but data object has it. Prisma ignores undefined? No.
                    // cleaner to recreate object or just delete slug
                }
            });
            // Removing slug from update just in case, though it's unique and matching
        } else {
            console.log(`Creating ${emp.name}...`);
            const newEmp = await prisma.employee.create({
                data: data
            });
            employeeId = newEmp.id;
        }

        // Set Custom Fields
        if (employeeId) {
            for (const field of emp.customFields) {
                await prisma.employeeCustomField.upsert({
                    where: {
                        employeeId_customFieldId: {
                            employeeId: employeeId,
                            customFieldId: field.fieldId
                        }
                    },
                    create: {
                        employeeId: employeeId,
                        customFieldId: field.fieldId,
                        value: field.value
                    },
                    update: {
                        value: field.value
                    }
                });
            }
        }
    }

    console.log("Injection complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
