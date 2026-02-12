import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getUserId() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('pathra_session')?.value;
    return sessionId ? parseInt(sessionId) : null;
}

// GET — community posts feed
export async function GET() {
    try {
        const userId = await getUserId();

        const posts = await prisma.community_posts.findMany({
            include: {
                users: { select: { id: true, name: true, avatar: true } },
                post_likes: userId ? { where: { user_id: userId } } : false,
                _count: { select: { post_comments: true, post_likes: true } },
            },
            orderBy: { created_at: 'desc' },
            take: 20,
        });

        return NextResponse.json(
            posts.map((post) => ({
                id: post.id,
                userName: post.users.name,
                avatar: post.users.avatar || '👤',
                content: post.content,
                imageUrl: post.image_url,
                likes: post._count.post_likes,
                liked: Array.isArray(post.post_likes) && post.post_likes.length > 0,
                comments: post._count.post_comments,
                timestamp: post.created_at,
            }))
        );
    } catch (error) {
        console.error('Community posts GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST — create community post
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { content, imageUrl } = await request.json();

        if (!content?.trim()) {
            return NextResponse.json({ error: 'Konten harus diisi' }, { status: 400 });
        }

        const post = await prisma.community_posts.create({
            data: {
                user_id: userId,
                content,
                image_url: imageUrl || null,
            },
        });

        return NextResponse.json({ id: post.id, success: true }, { status: 201 });
    } catch (error) {
        console.error('Community posts POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
