import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getUserId() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('pathra_session')?.value;
    return sessionId ? parseInt(sessionId) : null;
}

// GET — fetch user profile
export async function GET() {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const profile = await prisma.user_profiles.findUnique({
            where: { user_id: userId },
            include: { users: { select: { name: true, email: true, username: true, avatar: true } } }
        });

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Profile GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST — create or update user profile
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await request.json();

        // Check if profile exists
        const existingProfile = await prisma.user_profiles.findUnique({
            where: { user_id: userId }
        });

        let profile;
        if (existingProfile) {
            // Update
            profile = await prisma.user_profiles.update({
                where: { user_id: userId },
                data: {
                    age: data.age,
                    gender: data.gender,
                    height: data.height,
                    weight: data.weight,
                    daily_calorie_target: data.daily_calorie_target,
                    daily_steps_target: data.daily_steps_target,
                    daily_water_target: data.daily_water_target,
                    daily_protein_target: data.daily_protein_target,
                    daily_carbs_target: data.daily_carbs_target,
                    daily_fat_target: data.daily_fat_target,
                    favorite_sports: data.favorite_sports,
                    health_motivation: data.health_motivation,
                    onboarding_completed: true,
                    updated_at: new Date(),
                }
            });
        } else {
            // Create
            profile = await prisma.user_profiles.create({
                data: {
                    user_id: userId,
                    age: data.age,
                    gender: data.gender,
                    height: data.height,
                    weight: data.weight,
                    daily_calorie_target: data.daily_calorie_target || 2500,
                    daily_steps_target: data.daily_steps_target || 10000,
                    favorite_sports: data.favorite_sports,
                    health_motivation: data.health_motivation,
                    onboarding_completed: true,
                }
            });
        }

        return NextResponse.json({ success: true, profile });
    } catch (error) {
        console.error('Profile POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
