import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDateShort, STAGE_LABELS, ROLE_LABELS } from '@/lib/utils';

async function getDashboardData(userId: string, role: string) {
  const base = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, prodi: true, institusi: true, role: true },
  });

  if (role === 'MAHASISWA') {
    const [saved, citations, enrollments, consultations, research, subscription] = await Promise.all([
      prisma.savedResource.count({ where: { userId } }),
      prisma.citation.count({ where: { userId } }),
      prisma.trainingEnroll.findMany({
        where: { userId },
        include: { training: { select: { title: true, type: true, topic: true } } },
        orderBy: { createdAt: 'desc' }, take: 3,
      }),
      prisma.consultation.findMany({
        where: { mahasiswaId: userId },
        include: { pakar: { select: { name: true, role: true } } },
        orderBy: { createdAt: 'desc' }, take: 3,
      }),
      prisma.researchSession.findMany({
        where: { mahasiswaId: userId },
        include: {
          mentor: { select: { name: true } },
          milestones: true,
        },
        orderBy: { createdAt: 'desc' }, take: 2,
      }),
    ]);
    return { base, saved, citations, enrollments, consultations, research };
  }

  // Pustakawan / Pakar
  const [consultations, sessions] = await Promise.all([
    prisma.consultation.findMany({
      where: { pakarId: userId },
      include: { mahasiswa: { select: { name: true, prodi: true } } },
      orderBy: { updatedAt: 'desc' }, take: 5,
    }),
    prisma.researchSession.findMany({
      where: { mentorId: userId },
      include: { mahasiswa: { select: { name: true, prodi: true } } },
      orderBy: { updatedAt: 'desc' }, take: 5,
    }),
  ]);
  return { base, consultations, sessions, saved: 0, citations: 0, enrollments: [], research: [] };
}

const STATUS_STYLE: Record<string, string> = {
  OPEN: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  RESOLVED: 'bg-green-50 text-green-700 border-green-200',
  CLOSED: 'bg-gray-100 text-gray-600 border-gray-200',
  ENROLLED: 'bg-teal-50 text-teal-700 border-teal-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  ACTIVE: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const data = await getDashboardData(userId, role);

  const firstName = session.user?.name?.split(' ')[0];

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--parchment)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-display font-bold text-xl shadow-md"
              style={{ background: 'linear-gradient(135deg, var(--teal), var(--teal-light))' }}>
              {session.user?.name?.[0]}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                Selamat datang, {firstName}!
              </h1>
              <p className="text-sm" style={{ color: 'var(--slate)' }}>
                {ROLE_LABELS[role]}
                {data.base?.prodi && ` · ${data.base.prodi}`}
                {data.base?.institusi && ` · ${data.base.institusi}`}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/repository" className="btn-outline text-sm">📚 Cari Referensi</Link>
            <Link href="/konsultasi" className="btn-primary text-sm">💬 Konsultasi</Link>
          </div>
        </div>

        {role === 'MAHASISWA' ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: '📌', label: 'Referensi Tersimpan', value: (data as any).saved },
                { icon: '📝', label: 'Sitasi Dibuat', value: (data as any).citations },
                { icon: '🎓', label: 'Pelatihan Diikuti', value: (data as any).enrollments?.length },
                { icon: '🔬', label: 'Sesi Riset', value: (data as any).research?.length },
              ].map((s) => (
                <div key={s.label} className="card p-5 text-center">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--teal)' }}>{s.value}</div>
                  <div className="text-xs" style={{ color: 'var(--slate)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Research sessions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--ink)' }}>Pendampingan Riset Aktif</h2>
                    <Link href="/pendampingan" className="text-xs font-semibold" style={{ color: 'var(--teal)' }}>Lihat semua →</Link>
                  </div>
                  {(data as any).research?.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🔬</div>
                      <p className="text-sm mb-4" style={{ color: 'var(--slate)' }}>Belum ada sesi pendampingan riset</p>
                      <Link href="/pendampingan" className="btn-primary text-sm">Mulai Pendampingan</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(data as any).research.map((rs: any) => {
                        const done = rs.milestones.filter((m: any) => m.isDone).length;
                        const total = rs.milestones.length;
                        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                        return (
                          <Link href="/pendampingan" key={rs.id} className="block p-4 rounded-xl border hover:border-teal-300 transition-colors" style={{ borderColor: '#e8e4d8', background: 'var(--parchment)' }}>
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div>
                                <p className="font-semibold text-sm leading-snug" style={{ color: 'var(--ink)', fontFamily: 'Lora, serif' }}>{rs.title}</p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--slate)' }}>Mentor: {rs.mentor.name}</p>
                              </div>
                              <span className="text-xs px-2 py-0.5 rounded-full border font-medium shrink-0" style={{ background: 'var(--teal-pale)', color: 'var(--teal)', borderColor: '#99d4d6' }}>
                                {STAGE_LABELS[rs.stage]}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 rounded-full" style={{ background: '#e8e4d8' }}>
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--teal)' }} />
                              </div>
                              <span className="text-xs font-semibold" style={{ color: 'var(--teal)' }}>{done}/{total} milestone</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Pelatihan */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--ink)' }}>Pelatihan Terdaftar</h2>
                    <Link href="/pelatihan" className="text-xs font-semibold" style={{ color: 'var(--teal)' }}>Lihat semua →</Link>
                  </div>
                  {(data as any).enrollments?.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-3xl mb-2">🎓</div>
                      <p className="text-sm mb-3" style={{ color: 'var(--slate)' }}>Belum ikut pelatihan apapun</p>
                      <Link href="/pelatihan" className="btn-outline text-sm">Jelajahi Pelatihan</Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(data as any).enrollments.map((e: any) => (
                        <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--parchment)' }}>
                          <div className="text-xl">🎓</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{e.training.title}</p>
                            <p className="text-xs" style={{ color: 'var(--slate)' }}>{e.training.type} · {e.training.topic}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLE[e.status]}`}>{e.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                {/* Consultations */}
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Konsultasi Aktif</h2>
                    <Link href="/konsultasi" className="text-xs font-semibold" style={{ color: 'var(--teal)' }}>+ Baru</Link>
                  </div>
                  {(data as any).consultations?.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-2xl mb-2">💬</div>
                      <p className="text-xs mb-3" style={{ color: 'var(--slate)' }}>Belum ada konsultasi</p>
                      <Link href="/konsultasi" className="btn-primary text-xs py-2">Mulai Konsultasi</Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(data as any).consultations.map((c: any) => (
                        <Link href="/konsultasi" key={c.id} className="block p-3 rounded-lg border hover:border-teal-300 transition-colors" style={{ borderColor: '#e8e4d8' }}>
                          <p className="text-xs font-medium line-clamp-2 mb-1" style={{ color: 'var(--ink)' }}>{c.topic}</p>
                          <p className="text-xs" style={{ color: 'var(--slate)' }}>{c.pakar.name}</p>
                          <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick links */}
                <div className="card p-5">
                  <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--ink)' }}>Akses Cepat</h2>
                  <div className="space-y-1">
                    {[
                      { href: '/repository', icon: '📚', label: 'Repositori Digital' },
                      { href: '/repository?type=JOURNAL', icon: '📄', label: 'Jurnal Ilmiah' },
                      { href: '/repository?type=EBOOK', icon: '📕', label: 'E-Book' },
                      { href: '/pelatihan?topic=Mendeley', icon: '🔧', label: 'Pelatihan Mendeley' },
                      { href: '/konsultasi', icon: '💬', label: 'Tanya Pustakawan' },
                    ].map((l) => (
                      <Link key={l.href} href={l.href} className="nav-link text-sm">
                        <span>{l.icon}</span> {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Pustakawan / Pakar dashboard */
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: '💬', label: 'Total Konsultasi', value: (data as any).consultations?.length },
                { icon: '🔴', label: 'Perlu Direspons', value: (data as any).consultations?.filter((c: any) => c.status === 'OPEN').length },
                { icon: '🔬', label: 'Sesi Pendampingan', value: (data as any).sessions?.length },
                { icon: '✅', label: 'Selesai Tahun Ini', value: (data as any).consultations?.filter((c: any) => c.status === 'RESOLVED').length },
              ].map((s) => (
                <div key={s.label} className="card p-5 text-center">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--teal)' }}>{s.value}</div>
                  <div className="text-xs" style={{ color: 'var(--slate)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h2 className="font-display font-semibold text-lg mb-5" style={{ color: 'var(--ink)' }}>Antrian Konsultasi</h2>
                {(data as any).consultations?.length === 0 ? (
                  <div className="text-center py-10"><div className="text-4xl mb-2">✨</div><p className="text-sm" style={{ color: 'var(--slate)' }}>Tidak ada konsultasi saat ini</p></div>
                ) : (
                  <div className="space-y-3">
                    {(data as any).consultations.map((c: any) => (
                      <Link href="/konsultasi" key={c.id} className="block p-4 rounded-xl border hover:border-teal-300 transition-colors" style={{ borderColor: '#e8e4d8', background: 'var(--parchment)' }}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{c.mahasiswa.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                        </div>
                        <p className="text-xs line-clamp-2 mb-1" style={{ color: 'var(--slate)' }}>{c.topic}</p>
                        <p className="text-xs" style={{ color: 'var(--slate)' }}>{c.mahasiswa.prodi}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="card p-6">
                <h2 className="font-display font-semibold text-lg mb-5" style={{ color: 'var(--ink)' }}>Sesi Pendampingan</h2>
                {(data as any).sessions?.length === 0 ? (
                  <div className="text-center py-10"><div className="text-4xl mb-2">🔬</div><p className="text-sm" style={{ color: 'var(--slate)' }}>Belum ada sesi pendampingan</p></div>
                ) : (
                  <div className="space-y-3">
                    {(data as any).sessions.map((rs: any) => (
                      <div key={rs.id} className="p-4 rounded-xl border" style={{ borderColor: '#e8e4d8', background: 'var(--parchment)' }}>
                        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink)', fontFamily: 'Lora, serif' }}>{rs.title}</p>
                        <p className="text-xs" style={{ color: 'var(--slate)' }}>{rs.mahasiswa.name} · {rs.mahasiswa.prodi}</p>
                        <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full border font-medium" style={{ background: 'var(--teal-pale)', color: 'var(--teal)', borderColor: '#99d4d6' }}>
                          {STAGE_LABELS[rs.stage]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
