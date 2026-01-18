import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 10-char random slug generator
function generateSlug(length = 10) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function main() {
    // Find Galactic Gourmet company
    const company = await prisma.company.findFirst({
        where: { name: 'Galactic Gourmet' },
        include: { employees: true }
    });

    if (!company) {
        console.log('Galactic Gourmet company not found');
        return;
    }

    console.log(`Found ${company.employees.length} employees in Galactic Gourmet\n`);
    console.log('Updating slugs...\n');

    for (const emp of company.employees) {
        const newSlug = generateSlug();
        await prisma.employee.update({
            where: { id: emp.id },
            data: { slug: newSlug }
        });
        console.log(`${emp.name}: /${emp.slug} → /${newSlug}`);
    }

    console.log('\n✅ All slugs updated!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
