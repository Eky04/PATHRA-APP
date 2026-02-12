import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getUserId() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('pathra_session')?.value;
    return sessionId ? parseInt(sessionId) : null;
}

// GET — user's food logs (today by default)
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

        const startOfDay = new Date(date + 'T00:00:00');
        const endOfDay = new Date(date + 'T23:59:59');

        const logs = await prisma.food_logs.findMany({
            where: {
                user_id: userId,
                logged_at: { gte: startOfDay, lte: endOfDay },
            },
            orderBy: { logged_at: 'desc' },
        });

        return NextResponse.json(
            logs.map((log) => ({
                id: log.id,
                foodName: log.food_name,
                mealCategory: log.meal_category,
                calories: log.calories,
                protein: Number(log.protein),
                carbs: Number(log.carbs),
                fat: Number(log.fat),
                portion: log.portion,
                photoUrl: log.photo_url,
                loggedAt: log.logged_at,
            }))
        );
    } catch (error) {
        console.error('Food logs GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST — create food log
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await request.json();

        const log = await prisma.food_logs.create({
            data: {
                user_id: userId,
                food_item_id: data.foodItemId || null,
                food_name: data.foodName,
                meal_category: data.mealCategory || 'snack',
                calories: data.calories || 0,
                protein: data.protein || 0,
                carbs: data.carbs || 0,
                fat: data.fat || 0,
                portion: data.portion,
                photo_url: data.photoUrl,
                logged_at: new Date(),
            },
        });

        return NextResponse.json({ id: log.id, success: true }, { status: 201 });
    } catch (error) {
        console.error('Food logs POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
