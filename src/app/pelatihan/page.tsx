import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TRAINING_BADGE } from '@/lib/utils';
import EnrollButton from './EnrollButton';

const TOPICS = ['Semua', 'Penelusuran Database', 'Mendeley', 'Zotero', 'Academic Writing', 'Open Access', 'Systematic Review'];
const TYPES = ['Semua', 'WEBINAR', 'WORKSHOP', 'MODUL', 'VIDEO'];

async function getTrainings(topic?: string, type?: string) {
  return prisma.training.findMany({
    where: {
      isPublished: true,
      ...(topic && topic !== 'Semua' ? { topic } : {}),
      ...(type && type !== 'Semua' ? { type } : {}),
    },
    include: { _count: { select: { enrollments: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

const TYPE_LABELS: Record<string, string> = { WEBINAR: 'Webinar', WORKSHOP: 'Workshop', MODUL: 'Modul', VIDEO: 'Video' };
const TYPE_ICONS: Record<string, string> = { WEBINAR: '🎙️', WORKSHOP: '🛠️', MODUL: '📋', VIDEO: '🎬' };

export default async function PelatihanPage({ searchParams }: { searchParams: { topic?: string; type?: string } }) {
  const session = await getServerSession(authOptions);
  const { topic, type } = searchParams;
  const trainings = await getTrainings(topic, type);

  const enrolledIds = session
    ? new Set((await prisma.trainingEnroll.findMany({
        where: { userId: (session.user as any).id },
        select: { trainingId: true },
      })).map((e) => e.trainingId))
    : new Set<string>();

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--parchment)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--teal)' }}>Literasi Digital</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--ink)' }}>
            Program Pelatihan Akademik
          </h1>
          <p className="text-base max-w-2xl" style={{ color: 'var(--slate)' }}>
            Tingkatkan kemampuan penelusuran database, manajemen referensi, dan penulisan ilmiah melalui webinar, workshop, dan modul self-paced.
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-8">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold self-center" style={{ color: 'var(--slate)' }}>Tipe:</span>
            {TYPES.map((t) => (
              <a key={t} href={`/pelatihan?type=${t === 'Semua' ? '' : t}&topic=${topic || ''}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
                style={((!type && t === 'Semua') || type === t)
                  ? { background: 'var(--teal)', color: 'white', borderColor: 'var(--teal)' }
                  : { background: 'white', color: 'var(--ink-muted)', borderColor: '#e8e4d8' }}>
                {TYPE_ICONS[t] || ''} {t}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold self-center" style={{ color: 'var(--slate)' }}>Topik:</span>
            {TOPICS.map((t) => (
              <a key={t} href={`/pelatihan?type=${type || ''}&topic=${t === 'Semua' ? '' : t}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                style={((!topic && t === 'Semua') || topic === t)
                  ? { background: 'var(--amber)', color: 'white', borderColor: 'var(--amber)' }
                  : { background: 'white', color: 'var(--ink-muted)', borderColor: '#e8e4d8' }}>
                {t}
              </a>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { n: trainings.length, label: 'Program tersedia' },
            { n: trainings.filter(t => t.type === 'WEBINAR' || t.type === 'WORKSHOP').length, label: 'Live session' },
            { n: trainings.reduce((a, t) => a + t._count.enrollments, 0), label: 'Total peserta' },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <div className="font-display text-2xl font-bold" style={{ color: 'var(--teal)' }}>{s.n}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--slate)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Training grid */}
        {trainings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-display text-xl mb-2" style={{ color: 'var(--ink)' }}>Tidak ada program</p>
            <a href="/pelatihan" className="btn-outline">Tampilkan semua</a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainings.map((t) => {
              const isEnrolled = enrolledIds.has(t.id);
              return (
                <div key={t.id} className="card p-6 flex flex-col">
                  {/* Type badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                      style={t.type === 'WEBINAR' ? { background: 'var(--teal-pale)', color: 'var(--teal)', borderColor: '#99d4d6' } :
                             t.type === 'WORKSHOP' ? { background: 'var(--amber-pale)', color: 'var(--amber)', borderColor: '#f5d49a' } :
                             { background: '#fdf4ff', color: '#7e22ce', borderColor: '#e9d5ff' }}>
                      {TYPE_ICONS[t.type]} {TYPE_LABELS[t.type] || t.type}
                    </span>
                    {isEnrolled && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                        ✓ Terdaftar
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-base leading-snug mb-2 flex-1"
                    style={{ color: 'var(--ink)', fontFamily: 'Lora, serif' }}>
                    {t.title}
                  </h3>

                  <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--slate)' }}>{t.description}</p>

                  {/* Meta */}
                  <div className="space-y-1.5 mb-5 text-xs" style={{ color: 'var(--slate)' }}>
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span>{t.instructor}</span>
                    </div>
                    {t.duration && (
                      <div className="flex items-center gap-2">
                        <span>⏱</span>
                        <span>{t.duration} menit</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <span>{t._count.enrollments} peserta terdaftar{t.maxParticipants ? ` / maks ${t.maxParticipants}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🏷️</span>
                      <span className="px-2 py-0.5 rounded" style={{ background: 'var(--parchment-dark)' }}>{t.topic}</span>
                    </div>
                  </div>

                  <EnrollButton trainingId={t.id} isEnrolled={isEnrolled} isLoggedIn={!!session} isFull={!!(t.maxParticipants && t._count.enrollments >= t.maxParticipants)} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
