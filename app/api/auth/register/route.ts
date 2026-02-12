import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const { username, password, name, email } = await request.json();

        if (!username || !password || !name || !email) {
            return NextResponse.json(
                { error: 'Semua field harus diisi' },
                { status: 400 }
            );
        }

        // Check if username or email already exists
        const existingUser = await prisma.users.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });

        if (existingUser) {
            const field = existingUser.username === username ? 'Username' : 'Email';
            return NextResponse.json(
                { error: `${field} sudah terdaftar` },
                { status: 409 }
            );
        }

        // Create user, profile, and leaderboard entry
        const user = await prisma.users.create({
            data: {
                username,
                password,
                name,
                email,
                role: 'user',
                user_profiles: {
                    create: {
                        daily_calorie_target: 2500,
                        daily_steps_target: 10000,
                        daily_water_target: 2000,
                        onboarding_completed: false,
                    },
                },
                leaderboard: {
                    create: {
                        total_points: 0,
                        current_streak: 0,
                        longest_streak: 0,
                    },
                },
            },
        });

        // Session cookie removed to require login after registration

        return NextResponse.json({
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            onboardingCompleted: false,
        });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
