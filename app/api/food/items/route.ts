import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — list food items (popular ones)
export async function GET() {
    try {
        const items = await prisma.food_items.findMany({
            orderBy: { is_popular: 'desc' },
        });

        return NextResponse.json(
            items.map((item) => ({
                id: item.id,
                name: item.name,
                calories: item.calories,
                protein: Number(item.protein),
                carbs: Number(item.carbs),
                fat: Number(item.fat),
                portion: item.portion,
                image: item.image,
                category: item.category,
                isPopular: item.is_popular,
            }))
        );
    } catch (error) {
        console.error('Food items GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
