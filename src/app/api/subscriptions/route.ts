import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const PLAN_PRICES: Record<string, number> = {
  FREE: 0, PELAJAR: 29000, PENELITI: 59000, SKRIPSI: 1500000,
};

const PLAN_MONTHS: Record<string, number | null> = {
  FREE: null, PELAJAR: 1, PENELITI: 1, SKRIPSI: 6,
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { plan } = await req.json();
  const userId = (session.user as any).id;
  const months = PLAN_MONTHS[plan];
  const endDate = months ? new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000) : null;

  const sub = await prisma.subscription.upsert({
    where: { userId },
    update: { plan, status: 'ACTIVE', startDate: new Date(), endDate, amount: PLAN_PRICES[plan] || 0, updatedAt: new Date() },
    create: { userId, plan, status: 'ACTIVE', endDate, amount: PLAN_PRICES[plan] || 0 },
  });
  return NextResponse.json(sub, { status: 200 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sub = await prisma.subscription.findUnique({ where: { userId: (session.user as any).id } });
  return NextResponse.json(sub);
}
