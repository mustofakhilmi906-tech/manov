import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { TYPE_LABELS, formatDate } from '@/lib/utils';
import SaveButton from './SaveButton';
import CitationBox from './CitationBox';
import Link from 'next/link';

const TYPE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  EBOOK:   { bg: '#eef2ff', color: '#3730a3', border: '#c7d2fe' },
  JOURNAL: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  PAPER:   { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' },
  VIDEO:   { bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' },
  THESIS:  { bg: '#f0f9ff', color: '#075985', border: '#bae6fd' },
};

export default async function ResourceDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const resource = await prisma.resource.findUnique({ where: { id: params.id } });
  if (!resource) notFound();

  const related = await prisma.resource.findMany({
    where: { category: resource.category, id: { not: resource.id } },
    take: 3, orderBy: { downloadCount: 'desc' },
  });

  let isSaved = false;
  if (session) {
    const saved = await prisma.savedResource.findUnique({
      where: { userId_resourceId: { userId: (session.user as any).id, resourceId: resource.id } },
    });
    isSaved = !!saved;
  }

  const tc = TYPE_COLORS[resource.type] || { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
  const tags = resource.tags?.split(',').map((t) => t.trim()).filter(Boolean) || [];

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--parchment)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--slate)' }}>
          <Link href="/repository" className="hover:underline" style={{ color: 'var(--teal)' }}>Repositori</Link>
          <span>/</span>
          <span className="truncate max-w-xs">{resource.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-8">
              {/* Type + badges */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="px-3 py-1 rounded-full text-sm font-semibold border"
                  style={{ background: tc.bg, color: tc.color, borderColor: tc.border }}>
                  {TYPE_LABELS[resource.type] || resource.type}
                </span>
                {resource.isOpenAccess && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                    🔓 Open Access
                  </span>
                )}
                {resource.isPremium && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'var(--amber-pale)', color: 'var(--amber)', border: '1px solid #f5d49a' }}>
                    ⭐ Premium
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold leading-snug mb-4" style={{ color: 'var(--ink)' }}>
                {resource.title}
              </h1>

              <p className="text-sm font-medium mb-1" style={{ color: 'var(--teal)' }}>{resource.authors}</p>
              <p className="text-xs mb-6" style={{ color: 'var(--slate)' }}>
                {[resource.publisher, resource.year, resource.language].filter(Boolean).join(' · ')}
                {resource.doi && <span> · DOI: <a href={`https://doi.org/${resource.doi}`} target="_blank" rel="noopener" className="underline" style={{ color: 'var(--teal)' }}>{resource.doi}</a></span>}
              </p>

              <div className="border-t pt-5 mb-5" style={{ borderColor: '#e8e4d8' }}>
                <h2 className="font-display font-semibold mb-3 text-sm uppercase tracking-wide" style={{ color: 'var(--ink-muted)' }}>Abstrak</h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)', lineHeight: '1.8' }}>{resource.abstract}</p>
              </div>

              {/* Subject + tags */}
              {(resource.subject || tags.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {resource.subject && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: 'var(--teal-pale)', color: 'var(--teal)', border: '1px solid #99d4d6' }}>
                      {resource.subject}
                    </span>
                  )}
                  {tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg text-xs" style={{ background: 'var(--parchment-dark)', color: 'var(--slate)', border: '1px solid #e8e4d8' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Citation */}
            <CitationBox resource={{
              id: resource.id, title: resource.title, authors: resource.authors,
              year: resource.year, publisher: resource.publisher, doi: resource.doi,
            }} isLoggedIn={!!session} />

            {/* Related */}
            {related.length > 0 && (
              <div className="card p-6">
                <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--ink)' }}>Sumber Terkait</h2>
                <div className="space-y-3">
                  {related.map((r) => (
                    <Link key={r.id} href={`/repository/${r.id}`} className="flex gap-3 p-3 rounded-lg hover:bg-parchment transition-colors group"
                      style={{ background: 'var(--parchment)' }}>
                      <span className="text-xl shrink-0">{r.type === 'EBOOK' ? '📕' : r.type === 'JOURNAL' ? '📄' : '📑'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium line-clamp-1 group-hover:text-teal transition-colors" style={{ color: 'var(--ink)', fontFamily: 'Lora, serif' }}>{r.title}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--slate)' }}>{r.authors} · {r.year}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Action card */}
            <div className="card p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-5 text-sm" style={{ color: 'var(--slate)' }}>
                <span className="text-center"><span className="block font-display text-xl font-bold" style={{ color: 'var(--ink)' }}>{resource.viewCount.toLocaleString()}</span>Dilihat</span>
                <span className="text-center"><span className="block font-display text-xl font-bold" style={{ color: 'var(--ink)' }}>{resource.downloadCount.toLocaleString()}</span>Diunduh</span>
              </div>

              {resource.isOpenAccess || !resource.isPremium ? (
                <a href={resource.fileUrl || '#'} target="_blank" rel="noopener"
                  className="btn-primary w-full justify-center mb-3">
                  ⬇ Unduh / Baca
                </a>
              ) : (
                <div className="p-3 rounded-lg mb-3 text-center text-sm" style={{ background: 'var(--amber-pale)', color: 'var(--amber)', border: '1px solid #f5d49a' }}>
                  🔒 Konten Premium
                </div>
              )}

              <SaveButton resourceId={resource.id} isSaved={isSaved} isLoggedIn={!!session} />

              <div className="mt-5 pt-5 border-t space-y-2 text-sm" style={{ borderColor: '#e8e4d8' }}>
                {[
                  { label: 'Kategori', value: resource.category },
                  { label: 'Bahasa', value: resource.language },
                  { label: 'Tahun', value: resource.year?.toString() || '—' },
                  { label: 'Akses', value: resource.isOpenAccess ? 'Open Access' : 'Terbatas' },
                ].map((i) => (
                  <div key={i.label} className="flex justify-between">
                    <span style={{ color: 'var(--slate)' }}>{i.label}</span>
                    <span className="font-medium" style={{ color: 'var(--ink)' }}>{i.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
