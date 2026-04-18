import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { resourceId } = await req.json();
  const userId = (session.user as any).id;
  const existing = await prisma.savedResource.findUnique({ where: { userId_resourceId: { userId, resourceId } } });
  if (existing) {
    await prisma.savedResource.delete({ where: { userId_resourceId: { userId, resourceId } } });
    return NextResponse.json({ saved: false });
  }
  await prisma.savedResource.create({ data: { userId, resourceId } });
  return NextResponse.json({ saved: true });
}
