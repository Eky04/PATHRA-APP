
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Verifying Admin API Logic ---');

    // 1. Simulate Admin Fetch
    // We can't easily fetch localhost:3000 from here if the server is not running or if fetch is not polyfilled in this node env (Node 18+ has fetch).
    // Instead, let's just inspect the database directly to see if the data we expect to be served exists.
    // The API logic is:
    /*
          const user = await prisma.users.findUnique({
              where: { id: userId },
              include: {
                  user_profiles: true,
                  leaderboard: true,
                  activity_logs: {
                      orderBy: { created_at: 'desc' },
                      take: 10,
                  },
                  food_logs: {
                      orderBy: { created_at: 'desc' },
                      take: 10,
                  },
              },
          });
    */

    const userId = 2; // 'eky' (regular user)

    console.log(`Fetching data for User ID ${userId} (simulating what API would return)...`);

    const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
            user_profiles: true,
            // leaderboard: true, // Schema might not have this relation defined in the same way, let's check.
            // Wait, route.ts has `leaderboard: true`. If schema doesn't have it, route.ts would fail build.
            // Let's assume it exists. 
            activity_logs: {
                orderBy: { created_at: 'desc' },
                take: 10,
            },
            food_logs: {
                orderBy: { created_at: 'desc' },
                take: 10,
            },
        },
    });

    if (!user) {
        console.error('User not found!');
        return;
    }

    console.log('User Found:', user.name);
    console.log('Profile:', user.user_profiles ? 'Present' : 'Missing');
    console.log('Activity Logs Count:', user.activity_logs.length);
    console.log('Food Logs Count:', user.food_logs.length);

    if (user.activity_logs.length > 0) {
        console.log('Sample Activity:', user.activity_logs[0]);
    }
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
