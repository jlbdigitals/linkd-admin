import "dotenv/config";
import { PrismaClient } from "@prisma/client";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

function generateSlug(length = 5) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function main() {
    await prisma.employee.deleteMany();
    await prisma.company.deleteMany();

    // Create Company
    const company = await prisma.company.create({
        data: {
            name: "Decoflat",
            logoUrl: "https://via.placeholder.com/150",
        },
    });

    // Create Employee
    const employee = await prisma.employee.create({
        data: {
            slug: generateSlug(), // Short random ID
            name: "Jaime Doe",
            jobTitle: "Senior Developer",
            photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jaime",
            whatsapp: "+56912345678",
            phone: "+5622334455",
            email: "jaime@decoflat.cl",
            website: "https://decoflat.cl",
            instagram: "https://instagram.com/decoflat",
            linkedin: "https://linkedin.com/company/decoflat",
            googleReviews: "https://g.page/decoflat/review",
            companyId: company.id,
        },
    });

    console.log({ company, employee });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
