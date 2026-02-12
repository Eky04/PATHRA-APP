import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getUserId() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('pathra_session')?.value;
    return sessionId ? parseInt(sessionId) : null;
}

// POST — toggle like on a post
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const postId = parseInt(id);

        // Check if already liked
        const existingLike = await prisma.post_likes.findFirst({
            where: { post_id: postId, user_id: userId },
        });

        if (existingLike) {
            // Unlike
            await prisma.post_likes.delete({ where: { id: existingLike.id } });
            await prisma.community_posts.update({
                where: { id: postId },
                data: { likes_count: { decrement: 1 } },
            });
            return NextResponse.json({ liked: false });
        } else {
            // Like
            await prisma.post_likes.create({
                data: { post_id: postId, user_id: userId },
            });
            await prisma.community_posts.update({
                where: { id: postId },
                data: { likes_count: { increment: 1 } },
            });
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error('Like toggle error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
