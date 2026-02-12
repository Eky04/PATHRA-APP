import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — leaderboard rankings
export async function GET() {
    try {
        const rankings = await prisma.leaderboard.findMany({
            include: {
                users: { select: { name: true, avatar: true } },
            },
            orderBy: { total_points: 'desc' },
            take: 20,
        });

        return NextResponse.json(
            rankings.map((entry, idx) => ({
                rank: idx + 1,
                name: entry.users.name,
                avatar: entry.users.avatar || '👤',
                points: entry.total_points,
                streak: entry.current_streak,
            }))
        );
    } catch (error) {
        console.error('Leaderboard GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
