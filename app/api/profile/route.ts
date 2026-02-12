import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getUserId() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('pathra_session')?.value;
    return sessionId ? parseInt(sessionId) : null;
}

// GET — user profile
export async function GET() {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const profile = await prisma.user_profiles.findUnique({
            where: { user_id: userId },
        });

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Profile GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT — update profile
export async function PUT(request: NextRequest) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await request.json();

        const profile = await prisma.user_profiles.upsert({
            where: { user_id: userId },
            update: {
                daily_calorie_target: data.dailyCalorieTarget,
                daily_steps_target: data.dailyStepsTarget,
                daily_water_target: data.dailyWaterTarget,
                daily_protein_target: data.dailyProteinTarget,
                daily_carbs_target: data.dailyCarbsTarget,
                daily_fat_target: data.dailyFatTarget,
                favorite_sports: data.favoriteSports ? JSON.stringify(data.favoriteSports) : null,
                health_motivation: data.healthMotivation,
                onboarding_completed: data.onboardingCompleted ?? true,
            },
            create: {
                user_id: userId,
                daily_calorie_target: data.dailyCalorieTarget ?? 2500,
                daily_steps_target: data.dailyStepsTarget ?? 10000,
                daily_water_target: data.dailyWaterTarget ?? 2000,
                onboarding_completed: data.onboardingCompleted ?? true,
            },
        });

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Profile PUT error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
