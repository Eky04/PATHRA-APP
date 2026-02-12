import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('pathra_session')?.value;

        if (!sessionId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const user = await prisma.users.findUnique({
            where: { id: parseInt(sessionId) },
            include: { user_profiles: true, leaderboard: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        return NextResponse.json({
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            onboardingCompleted: user.user_profiles?.onboarding_completed ?? false,
            profile: user.user_profiles
                ? {
                    dailyCalorieTarget: user.user_profiles.daily_calorie_target,
                    dailyStepsTarget: user.user_profiles.daily_steps_target,
                    dailyWaterTarget: user.user_profiles.daily_water_target,
                }
                : null,
            leaderboard: user.leaderboard
                ? {
                    totalPoints: user.leaderboard.total_points,
                    currentStreak: user.leaderboard.current_streak,
                }
                : null,
        });
    } catch (error) {
        console.error('Auth me error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
