import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { TYPE_LABELS } from '@/lib/utils';

const TYPES = ['SEMUA', 'EBOOK', 'JOURNAL', 'PAPER', 'VIDEO', 'THESIS'];
const CATEGORIES = ['Semua', 'Metodologi', 'Teknologi', 'Hukum', 'Kedokteran', 'Ekonomi', 'Lingkungan', 'Literasi Digital', 'Penulisan Ilmiah'];
const LANGS = ['Semua', 'Indonesia', 'Inggris'];

const TYPE_ICONS: Record<string, string> = { EBOOK: '📕', JOURNAL: '📄', PAPER: '📑', VIDEO: '🎬', THESIS: '📘', SEMUA: '📚' };
const TYPE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  EBOOK:   { bg: '#eef2ff', color: '#3730a3', border: '#c7d2fe' },
  JOURNAL: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  PAPER:   { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' },
  VIDEO:   { bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' },
  THESIS:  { bg: '#f0f9ff', color: '#075985', border: '#bae6fd' },
};

async function getResources(type?: string, category?: string, lang?: string, search?: string) {
  return prisma.resource.findMany({
    where: {
      ...(type && type !== 'SEMUA' ? { type } : {}),
      ...(category && category !== 'Semua' ? { category } : {}),
      ...(lang && lang !== 'Semua' ? { language: lang } : {}),
      ...(search ? { OR: [{ title: { contains: search } }, { authors: { contains: search } }, { tags: { contains: search } }] } : {}),
    },
    orderBy: { downloadCount: 'desc' },
  });
}

export default async function RepositoryPage({ searchParams }: {
  searchParams: { type?: string; category?: string; lang?: string; search?: string };
}) {
  const { type, category, lang, search } = searchParams;
  const resources = await getResources(type, category, lang, search);

  return (
    <div className="min-h-screen" style={{ background: 'var(--parchment)' }}>
      {/* Header */}
      <div className="py-12 px-4" style={{ background: 'linear-gradient(135deg, var(--ink) 0%, var(--ink-light) 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--amber-light)' }}>Repositori Digital</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">Sumber Belajar Akademik</h1>
          <p className="text-base mb-8 max-w-xl" style={{ color: '#94a3b8' }}>
            E-book, jurnal ilmiah, paper penelitian, dan video tutorial dari sumber terpercaya nasional & internasional.
          </p>

          {/* Search */}
          <form className="flex gap-3 max-w-2xl">
            <div className="flex-1 relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input name="search" defaultValue={search} placeholder="Cari judul, penulis, topik..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm shadow-sm"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
            </div>
            <button type="submit" className="btn-amber px-6">Cari</button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 space-y-3">
          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <a key={t} href={`/repository?type=${t}&category=${category || 'Semua'}&lang=${lang || 'Semua'}${search ? `&search=${search}` : ''}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
                style={((!type && t === 'SEMUA') || type === t)
                  ? { background: 'var(--teal)', color: 'white', borderColor: 'var(--teal)' }
                  : { background: 'white', color: 'var(--ink-muted)', borderColor: '#e8e4d8' }}>
                {TYPE_ICONS[t]} {t === 'SEMUA' ? 'Semua' : TYPE_LABELS[t] || t}
              </a>
            ))}
          </div>

          {/* Category + Lang */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold" style={{ color: 'var(--slate)' }}>Bidang:</span>
            {CATEGORIES.map((c) => (
              <a key={c} href={`/repository?type=${type || 'SEMUA'}&category=${c}&lang=${lang || 'Semua'}${search ? `&search=${search}` : ''}`}
                className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                style={((!category && c === 'Semua') || category === c)
                  ? { background: 'var(--amber)', color: 'white', borderColor: 'var(--amber)' }
                  : { background: 'white', color: 'var(--ink-muted)', borderColor: '#e8e4d8' }}>
                {c}
              </a>
            ))}
          </div>
        </div>

        {/* Result count */}
        <p className="text-sm mb-5" style={{ color: 'var(--slate)' }}>
          <span className="font-semibold" style={{ color: 'var(--ink)' }}>{resources.length}</span> sumber ditemukan
          {search && <span> untuk &ldquo;{search}&rdquo;</span>}
        </p>

        {resources.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-display text-xl mb-2" style={{ color: 'var(--ink)' }}>Tidak ada hasil</p>
            <p className="text-sm mb-6" style={{ color: 'var(--slate)' }}>Coba kata kunci lain atau ubah filter</p>
            <a href="/repository" className="btn-outline">Tampilkan semua</a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((r) => {
              const tc = TYPE_COLORS[r.type] || { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
              return (
                <Link key={r.id} href={`/repository/${r.id}`} className="card p-5 block group flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{TYPE_ICONS[r.type] || '📄'}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold border"
                        style={{ background: tc.bg, color: tc.color, borderColor: tc.border }}>
                        {TYPE_LABELS[r.type] || r.type}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {r.isOpenAccess && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                          Open Access
                        </span>
                      )}
                      {r.isPremium && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--amber-pale)', color: 'var(--amber)', border: '1px solid #f5d49a' }}>
                          Premium
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-teal transition-colors flex-1"
                    style={{ color: 'var(--ink)', fontFamily: 'Lora, serif' }}>
                    {r.title}
                  </h3>
                  <p className="text-xs mb-1 line-clamp-1" style={{ color: 'var(--slate)' }}>{r.authors}</p>
                  <p className="text-xs line-clamp-2 mb-4" style={{ color: 'var(--slate)' }}>{r.abstract}</p>

                  <div className="flex items-center justify-between text-xs mt-auto pt-3 border-t" style={{ borderColor: '#f0ece0', color: 'var(--slate)' }}>
                    <div className="flex items-center gap-3">
                      <span>{r.year || '—'}</span>
                      <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--parchment)' }}>{r.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>👁 {r.viewCount.toLocaleString()}</span>
                      <span>⬇ {r.downloadCount.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
