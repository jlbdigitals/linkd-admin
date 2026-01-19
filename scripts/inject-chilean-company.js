const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Creating Cervecería Los Andes...");

    // 1. Create Company
    // Using upsert to avoid duplicates if run multiple times
    const company = await prisma.company.upsert({
        where: { id: "cerveceria-los-andes-manual-id" }, // Using a fixed ID to easily find it or identifying by name logic below would be better but ID is safer for upsert if we knew it.
        // actually, let's find by name first to be safe like before.
        update: {},
        create: {
            name: "Cervecería Los Andes",
            maxEmployees: 10,
            colorTop: "#b45309", // Amber 700
            colorBottom: "#fcd34d", // Amber 300
            gradientAngle: 45,
            bgImageUrl: null
        }
    }).catch(async () => {
        // Fallback if ID constraint fails or other issue, try find by name
        let c = await prisma.company.findFirst({ where: { name: "Cervecería Los Andes" } });
        if (!c) {
            c = await prisma.company.create({
                data: {
                    name: "Cervecería Los Andes",
                    maxEmployees: 10,
                    colorTop: "#b45309",
                    colorBottom: "#fcd34d",
                    gradientAngle: 45
                }
            });
        }
        return c;
    });

    // Update visibility
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

    // 2. Custom Fields
    const fields = [
        { label: "Cerveza Favorita", icon: "Beer", order: 0, placeholder: "Ej. Pale Ale" },
        { label: "Sucursal", icon: "MapPin", order: 1, placeholder: "Ej. Valdivia" }
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

    // 3. Employees
    const employeesData = [
        {
            name: "Pedro Morales",
            slug: "pedro-morales",
            jobTitle: "Maestro Cervecero",
            email: "pedro@cervecerialosandes.cl",
            whatsapp: "56998765432",
            phone: "+56 9 9876 5432",
            instagram: "pepo.brewer",
            linkedin: "https://linkedin.com/in/pedromorales",
            website: "https://cervecerialosandes.cl",
            googleReviews: "https://g.page/reviews/cerveceria-los-andes-valdivia",
            customFields: [
                { label: "Cerveza Favorita", value: "Stout Patagónica" },
                { label: "Sucursal", value: "Valdivia" }
            ]
        },
        {
            name: "Valentina Rojas",
            slug: "valentina-rojas",
            jobTitle: "Gerente de Ventas",
            email: "valentina@cervecerialosandes.cl",
            whatsapp: "56987654321",
            phone: "+56 9 8765 4321",
            instagram: "valeroches",
            linkedin: "https://linkedin.com/in/valentinarojas",
            website: "https://cervecerialosandes.cl",
            googleReviews: "https://g.page/reviews/cerveceria-los-andes-santiago",
            customFields: [
                { label: "Cerveza Favorita", value: "IPA Andina" },
                { label: "Sucursal", value: "Santiago" }
            ]
        },
        {
            name: "Matías Soto",
            slug: "matias-soto",
            jobTitle: "Logística y Distribución",
            email: "matias@cervecerialosandes.cl",
            whatsapp: "56912341234",
            phone: "+56 9 1234 1234",
            instagram: "mati_rutero",
            linkedin: "https://linkedin.com/in/matiassoto",
            website: "https://cervecerialosandes.cl",
            googleReviews: "https://g.page/reviews/cerveceria-los-andes",
            customFields: [
                { label: "Cerveza Favorita", value: "Lager Dorada" },
                { label: "Sucursal", value: "Concepción" }
            ]
        }
    ];

    for (const emp of employeesData) {
        console.log(`Processing ${emp.name}...`);

        const existing = await prisma.employee.findUnique({ where: { slug: emp.slug } });
        let employeeId = existing?.id;

        const data = {
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
        };

        if (existing) {
            await prisma.employee.update({
                where: { id: existing.id },
                data: { ...data, slug: undefined }
            });
        } else {
            const newEmp = await prisma.employee.create({ data });
            employeeId = newEmp.id;
        }

        for (const cf of emp.customFields) {
            await prisma.employeeCustomField.upsert({
                where: {
                    employeeId_customFieldId: {
                        employeeId: employeeId,
                        customFieldId: fieldIds[cf.label]
                    }
                },
                create: {
                    employeeId: employeeId,
                    customFieldId: fieldIds[cf.label],
                    value: cf.value
                },
                update: {
                    value: cf.value
                }
            });
        }
    }

    console.log("Chilean company injection complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
