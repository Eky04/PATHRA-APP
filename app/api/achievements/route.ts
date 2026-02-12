import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getUserId() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('pathra_session')?.value;
    return sessionId ? parseInt(sessionId) : null;
}

// GET — user achievements
export async function GET() {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const allAchievements = await prisma.achievements.findMany();
        const userAchievements = await prisma.user_achievements.findMany({
            where: { user_id: userId },
        });

        const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement_id));

        return NextResponse.json(
            allAchievements.map((a) => {
                const ua = userAchievements.find((u) => u.achievement_id === a.id);
                return {
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    icon: a.icon,
                    unlocked: unlockedIds.has(a.id),
                    date: ua?.unlocked_at || null,
                };
            })
        );
    } catch (error) {
        console.error('Achievements GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
