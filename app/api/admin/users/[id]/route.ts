import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// GET /api/admin/users/[id] — fetch detailed user data (admin only)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

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

        // Fetch User with relations
        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: {
                user_profiles: true,
                leaderboard: true,
                activity_logs: {
                    orderBy: { created_at: 'desc' },
                    take: 10,
                },
                food_logs: {
                    orderBy: { created_at: 'desc' },
                    take: 10,
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Calculate aggregate stats if needed
        // For now, raw data is sufficient for the modal

        return NextResponse.json(user);
    } catch (error) {
        console.error('Admin user detail fetch error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
