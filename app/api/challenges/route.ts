import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getUserId() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('pathra_session')?.value;
    return sessionId ? parseInt(sessionId) : null;
}

// GET — list challenges
export async function GET() {
    try {
        const userId = await getUserId();

        const challenges = await prisma.challenges.findMany({
            include: {
                _count: { select: { challenge_participants: true } },
                challenge_participants: userId ? { where: { user_id: userId } } : false,
            },
            orderBy: { end_date: 'asc' },
        });

        return NextResponse.json(
            challenges.map((ch) => ({
                id: ch.id,
                title: ch.title,
                description: ch.description,
                icon: ch.icon,
                startDate: ch.start_date,
                endDate: ch.end_date,
                participants: ch._count.challenge_participants,
                joined: Array.isArray(ch.challenge_participants) && ch.challenge_participants.length > 0,
                progress: Array.isArray(ch.challenge_participants) && ch.challenge_participants.length > 0
                    ? ch.challenge_participants[0].progress
                    : 0,
            }))
        );
    } catch (error) {
        console.error('Challenges GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST — join a challenge
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { challengeId } = await request.json();

        await prisma.challenge_participants.create({
            data: {
                challenge_id: challengeId,
                user_id: userId,
                progress: 0,
            },
        });

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error('Challenges POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
