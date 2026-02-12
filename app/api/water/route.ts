import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getUserId() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('pathra_session')?.value;
    return sessionId ? parseInt(sessionId) : null;
}

// GET — water logs for today
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

        const startOfDay = new Date(date + 'T00:00:00');
        const endOfDay = new Date(date + 'T23:59:59');

        const logs = await prisma.water_logs.findMany({
            where: {
                user_id: userId,
                logged_at: { gte: startOfDay, lte: endOfDay },
            },
            orderBy: { logged_at: 'desc' },
        });

        const totalMl = logs.reduce((sum, log) => sum + log.amount, 0);

        return NextResponse.json({ totalMl, logs });
    } catch (error) {
        console.error('Water GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST — log water intake
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { amount } = await request.json();

        const log = await prisma.water_logs.create({
            data: {
                user_id: userId,
                amount: amount || 250,
                logged_at: new Date(),
            },
        });

        return NextResponse.json({ id: log.id, success: true }, { status: 201 });
    } catch (error) {
        console.error('Water POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
