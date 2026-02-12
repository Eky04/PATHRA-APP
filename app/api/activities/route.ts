import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getUserId() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('pathra_session')?.value;
    return sessionId ? parseInt(sessionId) : null;
}

// GET — user activity logs
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserId();
        // If not logged in, return existing logs for guest (empty or handle on frontend) 
        // But here we return 401. Frontend will handle fallbacks.
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        const logs = await prisma.activity_logs.findMany({
            where: { user_id: userId },
            orderBy: { logged_at: 'desc' },
            take: limit,
        });

        return NextResponse.json(
            logs.map((log) => ({
                id: log.id.toString(), // Frontend expects string ID
                type: log.activity_type,
                duration: log.duration,
                calories: log.calories_burned,
                distance: log.distance ? Number(log.distance) : 0,
                avgHR: log.avg_heart_rate,
                date: new Date(log.logged_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                }),
                // Add exact timestamp for sorting if needed
                timestamp: log.logged_at.toISOString()
            }))
        );
    } catch (error) {
        console.error('Activities GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST — log new activity
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await request.json();

        // Validate required fields
        if (!data.type || !data.duration) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const log = await prisma.activity_logs.create({
            data: {
                user_id: userId,
                activity_type: data.type,
                duration: Number(data.duration),
                calories_burned: Number(data.calories) || 0,
                distance: data.distance ? Number(data.distance) : null,
                avg_heart_rate: data.avgHR ? Number(data.avgHR) : null,
                logged_at: new Date(), // Current time
            },
        });

        return NextResponse.json({
            id: log.id.toString(),
            success: true,
            // Return formatted date for immediate UI update
            date: new Date(log.logged_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })
        }, { status: 201 });
    } catch (error) {
        console.error('Activities POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
