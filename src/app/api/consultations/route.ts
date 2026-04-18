import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { topic, description, channel, pakarId } = await req.json();
  const consultation = await prisma.consultation.create({
    data: { mahasiswaId: (session.user as any).id, pakarId, topic, description, channel },
  });
  // first message from mahasiswa
  await prisma.consultMessage.create({
    data: { consultationId: consultation.id, senderId: (session.user as any).id, content: description },
  });
  return NextResponse.json(consultation, { status: 201 });
}
