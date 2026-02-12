
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Seeding Admin User ---');

    // Create or Update Admin User
    const adminEmail = 'admin@pathra.app';

    const admin = await prisma.users.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            username: 'eky admin',
            password: 'admin gacor', // Plain text for now as per previous implementation
            name: 'Eky Admin',
            email: adminEmail,
            role: 'admin',
            user_profiles: {
                create: {
                    daily_calorie_target: 2500,
                    onboarding_completed: true
                }
            }
        }
    });

    console.log('Admin user seeded:', admin);
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
