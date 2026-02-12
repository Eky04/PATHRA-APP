import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// GET /api/admin/users — fetch all users (admin only)
export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('pathra_session')?.value;

        if (!sessionId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Verify admin role
        const admin = await prisma.users.findUnique({
            where: { id: parseInt(sessionId) },
        });

        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Fetch all users with profiles
        const users = await prisma.users.findMany({
            include: { user_profiles: true, leaderboard: true },
            orderBy: { created_at: 'desc' },
        });

        const result = users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            username: u.username,
            role: u.role,
            avatar: u.avatar,
            joinedAt: u.created_at.toISOString().split('T')[0],
            onboardingCompleted: u.user_profiles?.onboarding_completed ?? false,
            points: u.leaderboard?.total_points ?? 0,
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Admin users fetch error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
