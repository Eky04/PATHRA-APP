import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getUserId() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('pathra_session')?.value;
    return sessionId ? parseInt(sessionId) : null;
}

// GET — progress stats (weekly, body metrics, achievements)
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Get last 7 days of food logs aggregated by day
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const foodLogs = await prisma.food_logs.findMany({
            where: {
                user_id: userId,
                logged_at: { gte: sevenDaysAgo },
            },
        });

        const activityLogs = await prisma.activity_logs.findMany({
            where: {
                user_id: userId,
                logged_at: { gte: sevenDaysAgo },
            },
        });

        const waterLogs = await prisma.water_logs.findMany({
            where: {
                user_id: userId,
                logged_at: { gte: sevenDaysAgo },
            },
        });

        // Aggregate by day
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const weeklyStats = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayFood = foodLogs.filter(
                (l) => l.logged_at.toISOString().split('T')[0] === dateStr
            );
            const dayActivity = activityLogs.filter(
                (l) => l.logged_at.toISOString().split('T')[0] === dateStr
            );
            const dayWater = waterLogs.filter(
                (l) => l.logged_at.toISOString().split('T')[0] === dateStr
            );

            weeklyStats.push({
                day: dayNames[date.getDay()],
                calories: dayFood.reduce((sum, l) => sum + l.calories, 0),
                steps: 0, // Would come from wearable
                water: dayWater.reduce((sum, l) => sum + l.amount, 0) / 1000,
                activities: dayActivity.length,
            });
        }

        // Get body metrics (latest)
        const bodyMetrics = await prisma.body_metrics.findMany({
            where: { user_id: userId },
            orderBy: { recorded_at: 'desc' },
            take: 1,
        });

        // Get achievements
        const allAchievements = await prisma.achievements.findMany();
        const userAchievements = await prisma.user_achievements.findMany({
            where: { user_id: userId },
        });
        const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement_id));

        // Get profile for targets
        const profile = await prisma.user_profiles.findUnique({
            where: { user_id: userId },
        });

        return NextResponse.json({
            weeklyStats,
            bodyMetrics: bodyMetrics.length > 0 ? {
                weight: Number(bodyMetrics[0].weight),
                bmi: Number(bodyMetrics[0].bmi),
                bodyFat: Number(bodyMetrics[0].body_fat),
                muscleMass: Number(bodyMetrics[0].muscle_mass),
                weightTarget: Number(bodyMetrics[0].weight_target),
                bmiTarget: Number(bodyMetrics[0].bmi_target),
                bodyFatTarget: Number(bodyMetrics[0].body_fat_target),
                muscleTarget: Number(bodyMetrics[0].muscle_target),
            } : null,
            achievements: allAchievements.map((a) => {
                const ua = userAchievements.find((u) => u.achievement_id === a.id);
                return {
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    icon: a.icon,
                    unlocked: unlockedIds.has(a.id),
                    date: ua?.unlocked_at || null,
                };
            }),
            monthlyMetrics: {
                calorieTarget: (profile?.daily_calorie_target ?? 2500) * 30,
                stepsTarget: (profile?.daily_steps_target ?? 10000) * 30,
                waterTarget: ((profile?.daily_water_target ?? 2000) * 30) / 1000,
            },
        });
    } catch (error) {
        console.error('Progress GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
