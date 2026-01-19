const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const company = await prisma.company.findFirst({
        where: { name: { contains: "Galactic Gourmet" } },
        include: {
            employees: {
                include: {
                    customFieldValues: true
                }
            }
        }
    });

    if (!company) {
        console.log("Company not found");
        return;
    }

    console.log(`Found company: ${company.name} (${company.employees.length} employees)`);

    for (const emp of company.employees) {
        console.log(`\nChecking ${emp.name} (${emp.slug}):`);
        const fields = [
            "jobTitle", "email", "whatsapp", "phone",
            "instagram", "linkedin", "website", "googleReviews", "photoUrl"
        ];

        let missing = [];
        for (const field of fields) {
            if (!emp[field]) {
                missing.push(field);
                console.log(`  ❌ Missing ${field}`);
            } else {
                // console.log(`  ✅ ${field}: ${emp[field].substring(0, 30)}...`);
            }
        }

        if (missing.length === 0) {
            console.log("  ✅ All standard fields present");
        }

        if (emp.customFieldValues.length === 0) {
            console.log("  ❌ No custom fields");
        } else {
            console.log(`  ✅ ${emp.customFieldValues.length} custom fields`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
