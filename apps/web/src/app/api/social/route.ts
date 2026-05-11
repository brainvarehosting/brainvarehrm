import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

export async function GET() {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ data: [], total: 0 });
    const posts = await prisma.socialPost.findMany({
      where: { organizationId: orgId },
      include: { author: { select: { firstName: true, lastName: true, employeeCode: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ data: posts, total: posts.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });
    const body = await request.json();
    const post = await prisma.socialPost.create({
      data: {
        organizationId: orgId, authorId: body.authorId || null,
        authorName: body.authorName || 'Anonymous',
        content: body.content, type: body.type || 'post',
      },
      include: { author: { select: { firstName: true, lastName: true, employeeCode: true } } },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const post = await prisma.socialPost.update({
      where: { id: body.id }, data: { likes: { increment: 1 } },
    });
    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
