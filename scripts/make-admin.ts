
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'zara@galactic.com';
    console.log(`Promoting ${email} to Admin...`);

    await prisma.employee.updateMany({
        where: { email },
        data: { isAdmin: true }
    });

    console.log('Done.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
