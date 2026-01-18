
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@linkd.com';
    console.log(`Creating Super Admin: ${email}...`);

    await prisma.superAdmin.upsert({
        where: { email },
        update: {},
        create: { email }
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
