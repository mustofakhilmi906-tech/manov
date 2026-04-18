import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { STAGE_LABELS, ROLE_LABELS, formatDateShort } from '@/lib/utils';
import NewSessionButton from './NewSessionButton';
import Link from 'next/link';

async function getMentors() {
  return prisma.user.findMany({
    where: { role: { in: ['PAKAR', 'PUSTAKAWAN'] } },
    select: {
      id: true, name: true, role: true, bio: true, prodi: true, institusi: true,
      researchAsMentor: { select: { id: true, status: true } },
    },
  });
}

async function getUserSessions(userId: string) {
  return prisma.researchSession.findMany({
    where: { mahasiswaId: userId },
    include: {
      mentor: { select: { name: true, role: true } },
      milestones: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

const STAGE_ORDER = ['TOPIC_SELECTION', 'PROPOSAL', 'DATA_COLLECTION', 'WRITING', 'REVISION', 'PUBLICATION'];

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  ON_HOLD: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default async function PendampinganPage() {
  const session = await getServerSession(authOptions);
  const mentors = await getMentors();
  const sessions = session ? await getUserSessions((session.user as any).id) : [];
  const role = (session?.user as any)?.role;

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--parchment)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--teal)' }}>Pendampingan Jangka Panjang</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--ink)' }}>
            Pendampingan Riset & Publikasi
          </h1>
          <p className="text-base max-w-2xl" style={{ color: 'var(--slate)' }}>
            Dapatkan mentor riset yang mendampingimu dari awal hingga publikasi — mulai perumusan masalah, penyusunan proposal, pengumpulan data, penulisan, revisi, hingga submission ke jurnal bereputasi.
          </p>
        </div>

        {/* Stages visual */}
        <div className="card p-6 mb-10 overflow-x-auto">
          <h2 className="font-display font-semibold mb-5" style={{ color: 'var(--ink)' }}>Tahapan Pendampingan</h2>
          <div className="flex items-center gap-0 min-w-max">
            {STAGE_ORDER.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className="text-center px-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2 border-2"
                    style={{ background: 'var(--teal-pale)', color: 'var(--teal)', borderColor: 'var(--teal)' }}>
                    {i + 1}
                  </div>
                  <p className="text-xs font-medium w-20 text-center" style={{ color: 'var(--ink)' }}>{STAGE_LABELS[s]}</p>
                </div>
                {i < STAGE_ORDER.length - 1 && (
                  <div className="w-8 h-0.5" style={{ background: 'var(--teal)', opacity: 0.3 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mentor list */}
          <div className="lg:col-span-1">
            <h2 className="font-display font-semibold text-lg mb-5" style={{ color: 'var(--ink)' }}>Pilih Mentor</h2>
            <div className="space-y-4">
              {mentors.map((m) => {
                const activeSessions = m.researchAsMentor.filter(s => s.status === 'ACTIVE').length;
                return (
                  <div key={m.id} className="card p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0 text-lg"
                        style={{ background: m.role === 'PAKAR' ? 'var(--amber)' : 'var(--teal)' }}>
                        {m.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{m.name}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={m.role === 'PAKAR' ? { background: 'var(--amber-pale)', color: 'var(--amber)' } : { background: 'var(--teal-pale)', color: 'var(--teal)' }}>
                          {ROLE_LABELS[m.role]}
                        </span>
                      </div>
                    </div>
                    {m.institusi && <p className="text-xs mb-2" style={{ color: 'var(--slate)' }}>🏛 {m.institusi}{m.prodi ? ` · ${m.prodi}` : ''}</p>}
                    <p className="text-xs leading-relaxed mb-3 line-clamp-3" style={{ color: 'var(--slate)' }}>{m.bio}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--slate)' }}>🔬 {activeSessions} sesi aktif</span>
                      {session && role === 'MAHASISWA' && (
                        <NewSessionButton mentorId={m.id} mentorName={m.name} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sessions */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--ink)' }}>
                {session ? 'Sesi Riset Saya' : 'Mulai Pendampingan'}
              </h2>
              {session && role === 'MAHASISWA' && (
                <NewSessionButton mentorId={mentors[0]?.id} mentorName={mentors[0]?.name} primary />
              )}
            </div>

            {!session ? (
              <div className="card p-12 text-center">
                <div className="text-5xl mb-4">🔬</div>
                <h3 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>Mulai Perjalanan Risetmu</h3>
                <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--slate)' }}>
                  Daftar dan dapatkan pendamping riset yang akan membantumu dari perumusan masalah hingga publikasi jurnal.
                </p>
                <Link href="/register" className="btn-primary">Daftar Gratis</Link>
              </div>
            ) : sessions.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>Belum Ada Sesi Pendampingan</h3>
                <p className="text-sm" style={{ color: 'var(--slate)' }}>Pilih mentor di sebelah kiri dan mulai perjalanan risetmu.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sessions.map((rs) => {
                  const doneCount = rs.milestones.filter(m => m.isDone).length;
                  const pct = rs.milestones.length > 0 ? Math.round((doneCount / rs.milestones.length) * 100) : 0;
                  const currentStageIdx = STAGE_ORDER.indexOf(rs.stage);

                  return (
                    <div key={rs.id} className="card p-6">
                      {/* Title + status */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <h3 className="font-display font-semibold text-base leading-snug" style={{ color: 'var(--ink)' }}>{rs.title}</h3>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--slate)' }}>Mentor: {rs.mentor.name}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 ${STATUS_STYLE[rs.status]}`}>
                          {rs.status === 'ACTIVE' ? '🟢 Aktif' : rs.status === 'COMPLETED' ? '✅ Selesai' : '⏸ Ditahan'}
                        </span>
                      </div>

                      {/* Stage progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-semibold" style={{ color: 'var(--ink)' }}>Tahap: {STAGE_LABELS[rs.stage]}</span>
                          <span style={{ color: 'var(--teal)' }}>{doneCount}/{rs.milestones.length} milestone</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: '#e8e4d8' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--teal)' }} />
                        </div>
                      </div>

                      {/* Mini stage timeline */}
                      <div className="flex gap-1 mb-5">
                        {STAGE_ORDER.map((s, i) => (
                          <div key={s} className="flex-1 h-1.5 rounded-full"
                            style={{ background: i <= currentStageIdx ? 'var(--teal)' : '#e8e4d8' }} />
                        ))}
                      </div>

                      {/* Milestones */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--ink-muted)' }}>Milestone</p>
                        {rs.milestones.map((m) => (
                          <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'var(--parchment)' }}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${m.isDone ? 'step-done' : 'step-todo'}`}
                              style={m.isDone ? { background: 'var(--teal)', color: 'white' } : { background: 'white', border: '1.5px solid #d1d5db' }}>
                              {m.isDone ? '✓' : ''}
                            </div>
                            <span className="text-xs flex-1" style={{ color: m.isDone ? 'var(--slate)' : 'var(--ink)', textDecoration: m.isDone ? 'line-through' : 'none' }}>
                              {m.title}
                            </span>
                            {m.dueDate && !m.isDone && (
                              <span className="text-xs" style={{ color: 'var(--amber)' }}>📅 {formatDateShort(m.dueDate)}</span>
                            )}
                            {m.isDone && m.doneAt && (
                              <span className="text-xs" style={{ color: 'var(--teal)' }}>✅ {formatDateShort(m.doneAt)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
