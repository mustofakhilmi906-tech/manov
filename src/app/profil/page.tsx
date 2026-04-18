import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ROLE_LABELS, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      savedResources: { include: { resource: { select: { id: true, title: true, type: true, authors: true } } }, orderBy: { createdAt: 'desc' }, take: 6 },
      citations: { orderBy: { createdAt: 'desc' }, take: 6 },
      enrollments: { include: { training: { select: { title: true, type: true } } } },
    },
  });

  if (!user) redirect('/login');

  const TYPE_ICONS: Record<string, string> = { EBOOK: '📕', JOURNAL: '📄', PAPER: '📑', VIDEO: '🎬', THESIS: '📘' };

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--parchment)' }}>
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-2xl font-bold mb-8" style={{ color: 'var(--ink)' }}>Profil Saya</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="space-y-5">
            <div className="card p-6 text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-display font-bold text-3xl mx-auto mb-4 shadow-md"
                style={{ background: 'linear-gradient(135deg, var(--teal), var(--teal-light))' }}>
                {user.name[0]}
              </div>
              <h2 className="font-display font-bold text-lg mb-1" style={{ color: 'var(--ink)' }}>{user.name}</h2>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: 'var(--teal-pale)', color: 'var(--teal)', border: '1px solid #99d4d6' }}>
                {ROLE_LABELS[user.role]}
              </span>
              {user.prodi && <p className="text-sm mt-2" style={{ color: 'var(--slate)' }}>{user.prodi}</p>}
              {user.institusi && <p className="text-xs" style={{ color: 'var(--slate)' }}>{user.institusi}</p>}
              {user.bio && <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--slate)' }}>{user.bio}</p>}
              <p className="text-xs mt-3" style={{ color: 'var(--slate)' }}>📧 {user.email}</p>
              <p className="text-xs" style={{ color: 'var(--slate)' }}>🗓 Bergabung {formatDate(user.createdAt)}</p>
            </div>

            {/* Stats */}
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--ink)' }}>Statistik</h3>
              <div className="space-y-3">
                {[
                  { icon: '📌', label: 'Referensi Tersimpan', value: user.savedResources.length },
                  { icon: '📝', label: 'Sitasi Dibuat', value: user.citations.length },
                  { icon: '🎓', label: 'Pelatihan Diikuti', value: user.enrollments.length },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--slate)' }}>{s.icon} {s.label}</span>
                    <span className="font-bold" style={{ color: 'var(--teal)' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved resources */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold" style={{ color: 'var(--ink)' }}>Referensi Tersimpan</h3>
                <Link href="/repository" className="text-xs font-semibold" style={{ color: 'var(--teal)' }}>+ Tambah</Link>
              </div>
              {user.savedResources.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--slate)' }}>Belum ada referensi tersimpan.</p>
              ) : (
                <div className="space-y-2">
                  {user.savedResources.map(({ resource }) => (
                    <Link key={resource.id} href={`/repository/${resource.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-parchment transition-colors group"
                      style={{ background: 'var(--parchment)' }}>
                      <span className="text-lg shrink-0">{TYPE_ICONS[resource.type] || '📄'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium line-clamp-1 group-hover:text-teal transition-colors" style={{ color: 'var(--ink)', fontFamily: 'Lora, serif' }}>{resource.title}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--slate)' }}>{resource.authors}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Citations */}
            <div className="card p-6">
              <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--ink)' }}>Koleksi Sitasi</h3>
              {user.citations.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--slate)' }}>Belum ada sitasi tersimpan. Buka referensi dan gunakan format sitasi otomatis.</p>
              ) : (
                <div className="space-y-3">
                  {user.citations.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg" style={{ background: 'var(--parchment)', border: '1px solid #e8e4d8' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--teal-pale)', color: 'var(--teal)' }}>{c.style}</span>
                        {c.projectName && <span className="text-xs" style={{ color: 'var(--slate)' }}>📁 {c.projectName}</span>}
                      </div>
                      <p className="text-xs leading-relaxed font-mono" style={{ color: 'var(--ink-muted)' }}>{c.formatted || `${c.authors}. (${c.year}). ${c.title}.`}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
