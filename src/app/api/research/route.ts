import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { title, description, stage, targetDate, mentorId } = await req.json();
  const rs = await prisma.researchSession.create({
    data: {
      mahasiswaId: (session.user as any).id,
      mentorId,
      title,
      description: description || '',
      stage: stage || 'TOPIC_SELECTION',
      ...(targetDate ? { targetDate: new Date(targetDate) } : {}),
      milestones: {
        create: [
          { title: 'Finalisasi topik & judul penelitian' },
          { title: 'Penyusunan proposal' },
          { title: 'Pengumpulan & analisis data' },
          { title: 'Penulisan naskah' },
          { title: 'Revisi & finalisasi' },
          { title: 'Submission ke jurnal' },
        ],
      },
    },
  });
  return NextResponse.json(rs, { status: 201 });
}
