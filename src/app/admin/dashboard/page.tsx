import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/');

  const [userCount, resourceCount, trainingCount, consultCount, subCount, recentUsers, recentConsults] = await Promise.all([
    prisma.user.count(),
    prisma.resource.count(),
    prisma.training.count(),
    prisma.consultation.count(),
    prisma.subscription.count({ where: { plan: { not: 'FREE' } } }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.consultation.findMany({
      orderBy: { createdAt: 'desc' }, take: 5,
      include: { mahasiswa: { select: { name: true } }, pakar: { select: { name: true } } },
    }),
  ]);

  const stats = [
    { icon: '👥', label: 'Total Pengguna', value: userCount, href: '/admin/users', color: 'var(--teal)' },
    { icon: '📚', label: 'Sumber Digital', value: resourceCount, href: '/admin/resources', color: 'var(--amber)' },
    { icon: '🎓', label: 'Program Pelatihan', value: trainingCount, href: '/admin/trainings', color: '#7c3aed' },
    { icon: '💬', label: 'Total Konsultasi', value: consultCount, href: '/konsultasi', color: '#be123c' },
    { icon: '⭐', label: 'Berlangganan Berbayar', value: subCount, href: '/admin/users', color: '#0891b2' },
  ];

  const ROLE_BADGE: Record<string, string> = {
    MAHASISWA: 'bg-blue-50 text-blue-700 border-blue-200',
    PUSTAKAWAN: 'bg-teal-50 text-teal-700 border-teal-200',
    PAKAR: 'bg-amber-50 text-amber-700 border-amber-200',
    ADMIN: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--parchment)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--teal)' }}>Panel Admin</p>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Dashboard Admin</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/resources" className="btn-primary text-sm">+ Tambah Sumber</Link>
            <Link href="/admin/trainings" className="btn-outline text-sm">+ Tambah Pelatihan</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="card p-5 block hover:shadow-md transition-shadow">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-display text-3xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color: 'var(--slate)' }}>{s.label}</div>
            </Link>
          ))}
        </div>

        {/* Admin nav */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { href: '/admin/resources', icon: '📚', label: 'Kelola Sumber Digital', desc: 'Tambah, edit, hapus e-book, jurnal, paper' },
            { href: '/admin/users', icon: '👥', label: 'Kelola Pengguna', desc: 'Lihat daftar pengguna dan status langganan' },
            { href: '/admin/trainings', icon: '🎓', label: 'Kelola Pelatihan', desc: 'Buat dan edit program pelatihan' },
          ].map((n) => (
            <Link key={n.href} href={n.href} className="card p-5 block group hover:shadow-md transition-shadow">
              <div className="text-2xl mb-2">{n.icon}</div>
              <h3 className="font-semibold text-sm mb-1 group-hover:text-teal transition-colors" style={{ color: 'var(--ink)' }}>{n.label}</h3>
              <p className="text-xs" style={{ color: 'var(--slate)' }}>{n.desc}</p>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent users */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold" style={{ color: 'var(--ink)' }}>Pengguna Terbaru</h2>
              <Link href="/admin/users" className="text-xs font-semibold" style={{ color: 'var(--teal)' }}>Lihat semua →</Link>
            </div>
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: 'var(--teal)' }}>{u.name[0]}</div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{u.name}</p>
                      <p className="text-xs" style={{ color: 'var(--slate)' }}>{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_BADGE[u.role]}`}>{u.role}</span>
                    <span className="text-xs" style={{ color: 'var(--slate)' }}>{formatDate(u.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent consultations */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold" style={{ color: 'var(--ink)' }}>Konsultasi Terbaru</h2>
            </div>
            <div className="space-y-3">
              {recentConsults.map((c) => (
                <div key={c.id} className="p-3 rounded-lg" style={{ background: 'var(--parchment)', border: '1px solid #e8e4d8' }}>
                  <p className="text-sm font-medium line-clamp-1" style={{ color: 'var(--ink)', fontFamily: 'Lora, serif' }}>{c.topic}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--slate)' }}>
                    {c.mahasiswa.name} → {c.pakar.name}
                  </p>
                  <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full border font-medium ${
                    c.status === 'OPEN' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    c.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-green-50 text-green-700 border-green-200'
                  }`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
