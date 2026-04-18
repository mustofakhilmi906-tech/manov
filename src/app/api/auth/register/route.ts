import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, prodi, institusi } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: 'Field tidak lengkap' }, { status: 400 });
    if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    const user = await prisma.user.create({
      data: { name, email, password: await bcrypt.hash(password, 10), role: role || 'MAHASISWA', prodi, institusi },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch { return NextResponse.json({ error: 'Registrasi gagal' }, { status: 500 }); }
}
