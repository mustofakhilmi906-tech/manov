import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const citation = await prisma.citation.create({
    data: { userId: (session.user as any).id, ...body },
  });
  return NextResponse.json(citation, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const citations = await prisma.citation.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(citations);
}
