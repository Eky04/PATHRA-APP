import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getUserId() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('pathra_session')?.value;
    return sessionId ? parseInt(sessionId) : null;
}

// GET — comments for a post
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const postId = parseInt(id);

        const comments = await prisma.post_comments.findMany({
            where: { post_id: postId },
            include: {
                users: { select: { name: true, avatar: true } },
            },
            orderBy: { created_at: 'asc' },
        });

        return NextResponse.json(
            comments.map((c) => ({
                id: c.id,
                userName: c.users.name,
                avatar: c.users.avatar || '👤',
                content: c.content,
                createdAt: c.created_at,
            }))
        );
    } catch (error) {
        console.error('Comments GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST — add comment
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const postId = parseInt(id);
        const { content } = await request.json();

        if (!content?.trim()) {
            return NextResponse.json({ error: 'Komentar harus diisi' }, { status: 400 });
        }

        const comment = await prisma.post_comments.create({
            data: {
                post_id: postId,
                user_id: userId,
                content,
            },
        });

        await prisma.community_posts.update({
            where: { id: postId },
            data: { comments_count: { increment: 1 } },
        });

        return NextResponse.json({ id: comment.id, success: true }, { status: 201 });
    } catch (error) {
        console.error('Comments POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
