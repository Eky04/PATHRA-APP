import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getUserId() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('pathra_session')?.value;
    return sessionId ? parseInt(sessionId) : null;
}

// GET — dashboard data: today's summary + user profile targets
export async function GET() {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const today = new Date().toISOString().split('T')[0];
        const startOfDay = new Date(today + 'T00:00:00');
        const endOfDay = new Date(today + 'T23:59:59');

        // Get user profile for targets
        const profile = await prisma.user_profiles.findUnique({
            where: { user_id: userId },
        });

        // Get today's food logs
        const foodLogs = await prisma.food_logs.findMany({
            where: {
                user_id: userId,
                logged_at: { gte: startOfDay, lte: endOfDay },
            },
            orderBy: { logged_at: 'desc' },
        });

        // Get today's activities
        const activityLogs = await prisma.activity_logs.findMany({
            where: {
                user_id: userId,
                logged_at: { gte: startOfDay, lte: endOfDay },
            },
        });

        // Get today's water
        const waterLogs = await prisma.water_logs.findMany({
            where: {
                user_id: userId,
                logged_at: { gte: startOfDay, lte: endOfDay },
            },
        });

        // Calculate totals
        const totalCalories = foodLogs.reduce((sum, log) => sum + log.calories, 0);
        const totalProtein = foodLogs.reduce((sum, log) => sum + Number(log.protein), 0);
        const totalCarbs = foodLogs.reduce((sum, log) => sum + Number(log.carbs), 0);
        const totalFat = foodLogs.reduce((sum, log) => sum + Number(log.fat), 0);
        const totalCaloriesBurned = activityLogs.reduce((sum, log) => sum + log.calories_burned, 0);
        const totalWaterMl = waterLogs.reduce((sum, log) => sum + log.amount, 0);

        return NextResponse.json({
            targets: {
                calories: profile?.daily_calorie_target ?? 2500,
                steps: profile?.daily_steps_target ?? 10000,
                water: profile?.daily_water_target ?? 2000,
            },
            today: {
                calories: totalCalories,
                caloriesBurned: totalCaloriesBurned,
                protein: totalProtein,
                carbs: totalCarbs,
                fat: totalFat,
                waterMl: totalWaterMl,
                activities: activityLogs.length,
                steps: 0, // Would come from wearable integration
            },
            foodLogs: foodLogs.map((log) => ({
                id: log.id,
                foodName: log.food_name,
                calories: log.calories,
                mealCategory: log.meal_category,
                loggedAt: log.logged_at,
            })),
            activityLogs: activityLogs.map((log) => ({
                id: log.id,
                activityType: log.activity_type,
                duration: log.duration,
                caloriesBurned: log.calories_burned,
                loggedAt: log.logged_at,
            })),
        });
    } catch (error) {
        console.error('Dashboard GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
