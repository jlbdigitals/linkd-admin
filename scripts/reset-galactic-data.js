const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Starting RESET for Galactic Gourmet...");

    // 1. Find Company
    const company = await prisma.company.findFirst({
        where: { name: { contains: "Galactic Gourmet" } }
    });

    if (!company) {
        console.log("Company not found, creating...");
        // ... create logic if needed, but likely exists
    } else {
        console.log(`Found Galactic Gourmet (ID: ${company.id}). Deleting all employees...`);
        // Delete all employees for this company to avoid old incomplete records
        await prisma.employee.deleteMany({
            where: { companyId: company.id }
        });
        console.log("All employees deleted.");
    }

    // Re-fetch company or create if needed (omitted for brevity as we know it exists usually)
    // Reuse previous injection logic but now we know we are creating fresh.

    const dishField = await prisma.customField.upsert({
        where: { id: "temp-id-placeholder-wont-work-need-find" }, // Upsert needs unique... find first is better
        create: { companyId: company.id, label: "Plato Especialidad", icon: "Utensils", order: 0 },
        update: {}
    }).catch(async () => {
        // fallback find
        return await prisma.customField.findFirst({ where: { companyId: company.id, label: "Plato Especialidad" } })
            || await prisma.customField.create({ data: { companyId: company.id, label: "Plato Especialidad", icon: "Utensils", order: 0 } });
    });

    // Re-implement fields finding properly
    const fields = [
        { label: "Plato Especialidad", icon: "Utensils", order: 0, placeholder: "Ej. Nebula Noodles" },
        { label: "Planeta de Origen", icon: "Globe", order: 1, placeholder: "Ej. Mars" }
    ];

    const fieldIds = {};

    for (const f of fields) {
        const existing = await prisma.customField.findFirst({
            where: { companyId: company.id, label: f.label }
        });
        if (existing) {
            fieldIds[f.label] = existing.id;
        } else {
            const newF = await prisma.customField.create({
                data: { ...f, companyId: company.id }
            });
            fieldIds[f.label] = newF.id;
        }
    }

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
                { label: "Plato Especialidad", value: "Quantum Quiche" },
                { label: "Planeta de Origen", value: "Moon Base Alpha" }
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
                { label: "Plato Especialidad", value: "Nebula Nectar Pairing" },
                { label: "Planeta de Origen", value: "Proxima Centauri b" }
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
                { label: "Plato Especialidad", value: "Black Hole Banquet" },
                { label: "Planeta de Origen", value: "Kepler-186f" }
            ]
        }
    ];

    for (const emp of employeesData) {
        console.log(`Creating ${emp.name}...`);
        const newEmp = await prisma.employee.create({
            data: {
                name: emp.name,
                slug: emp.slug,
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
            }
        });

        for (const cf of emp.customFields) {
            await prisma.employeeCustomField.create({
                data: {
                    employeeId: newEmp.id,
                    customFieldId: fieldIds[cf.label],
                    value: cf.value
                }
            });
        }
    }

    // Update company visibility settings to ensure everything is ON
    await prisma.company.update({
        where: { id: company.id },
        data: {
            fieldVisibility: {
                upsert: {
                    create: {
                        showWhatsapp: true, showEmail: true, showPhone: true,
                        showWebsite: true, showInstagram: true, showLinkedin: true, showGoogleReviews: true
                    },
                    update: {
                        showWhatsapp: true, showEmail: true, showPhone: true,
                        showWebsite: true, showInstagram: true, showLinkedin: true, showGoogleReviews: true
                    }
                }
            }
        }
    });

    console.log("Reset and injection complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
