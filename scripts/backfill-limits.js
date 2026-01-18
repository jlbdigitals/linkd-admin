const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Backfilling maxEmployees...");
    const count = await prisma.company.updateMany({
        data: { maxEmployees: 5 }
    });
    console.log(`Updated ${count.count} companies.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
