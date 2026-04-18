import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const consultationId = searchParams.get('consultationId');
  const since = searchParams.get('since'); // ISO timestamp for polling

  if (!consultationId) return NextResponse.json({ error: 'consultationId required' }, { status: 400 });

  const messages = await prisma.chatMessage.findMany({
    where: {
      consultationId,
      ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { consultationId, content } = await req.json();
  if (!consultationId || !content?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, role: true } });

  const msg = await prisma.chatMessage.create({
    data: {
      consultationId,
      senderId: userId,
      senderName: user?.name || 'Pengguna',
      senderRole: user?.role || 'MAHASISWA',
      content: content.trim(),
    },
  });

  // Update consultation status to IN_PROGRESS if it was OPEN
  await prisma.consultation.update({
    where: { id: consultationId },
    data: { status: 'IN_PROGRESS', updatedAt: new Date() },
  });

  return NextResponse.json(msg, { status: 201 });
}
