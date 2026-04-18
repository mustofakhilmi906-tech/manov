'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';

type Paper = {
  id: string;
  title: string;
  authors: string;
  year: number | null;
  abstract: string;
  venue: string;
  citationCount: number;
  isOpenAccess: boolean;
  pdfUrl: string | null;
  doi: string | null;
  types: string[];
  source: string;
};

const EXAMPLE_QUERIES = [
  'machine learning healthcare Indonesia',
  'systematic review COVID-19 vaccine',
  'bibliometric analysis education',
  'telemedicine patient satisfaction',
  'deep learning natural language processing',
];

function CiteBadge({ paper, onCite }: { paper: Paper; onCite: (p: Paper) => void }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { onCite(paper); setDone(true); setTimeout(() => setDone(false), 2000); }}
      className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors"
      style={done ? { background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' } : { borderColor: '#d1d5db', color: 'var(--slate)' }}>
      {done ? '✓ Tersimpan' : '📝 Sitasi APA'}
    </button>
  );
}

export default function JurnalEksternalPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Paper[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [citedIds, setCitedIds] = useState<Set<string>>(new Set());

  const search = useCallback(async (q?: string) => {
    const term = (q || query).trim();
    if (!term) return;
    setLoading(true); setError(''); setSearched(true);
    try {
      const res = await fetch(`/api/search/external?q=${encodeURIComponent(term)}&limit=12`);
      const data = await res.json();
      setResults(data.papers || []);
      setTotal(data.total || 0);
      if (data.error) setError(data.error);
    } catch {
      setError('Tidak dapat terhubung ke Semantic Scholar. Periksa koneksi internet.');
    } finally { setLoading(false); }
  }, [query]);

  const saveCitation = async (paper: Paper) => {
    const formatted = `${paper.authors}. (${paper.year || 'n.d.'}). ${paper.title}. ${paper.venue || ''}${paper.doi ? `. https://doi.org/${paper.doi}` : ''}.`;
    await fetch('/api/citations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: paper.title, authors: paper.authors, year: paper.year,
        publisher: paper.venue, doi: paper.doi, style: 'APA', formatted,
        projectName: 'Pencarian Eksternal',
      }),
    });
    setCitedIds(prev => new Set([...prev, paper.id]));
  };

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--parchment)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--teal)' }}>Integrasi Eksternal</p>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--teal-pale)', color: 'var(--teal)', border: '1px solid #99d4d6' }}>
              via Semantic Scholar
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--ink)' }}>
            Cari Jurnal Internasional
          </h1>
          <p className="text-base max-w-2xl" style={{ color: 'var(--slate)' }}>
            Telusuri lebih dari 200 juta paper ilmiah dari Semantic Scholar secara gratis — termasuk akses PDF open access, jumlah sitasi, dan format sitasi otomatis.
          </p>
        </div>

        {/* Search box */}
        <div className="card p-6 mb-8">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--slate)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="Cari topik, judul, atau kata kunci dalam bahasa Inggris/Indonesia..."
                className="input-base pl-10"
              />
            </div>
            <button onClick={() => search()} disabled={loading || !query.trim()} className="btn-primary px-6 disabled:opacity-60">
              {loading ? '🔍...' : 'Cari'}
            </button>
          </div>

          {/* Example queries */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs" style={{ color: 'var(--slate)' }}>Contoh:</span>
            {EXAMPLE_QUERIES.map((eq) => (
              <button key={eq} onClick={() => { setQuery(eq); search(eq); }}
                className="text-xs px-3 py-1 rounded-full border transition-colors hover:border-teal-400"
                style={{ borderColor: '#d1d5db', color: 'var(--ink-muted)' }}>
                {eq}
              </button>
            ))}
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl mb-6" style={{ background: 'var(--amber-pale)', border: '1px solid #f5d49a' }}>
          <span className="text-lg shrink-0">💡</span>
          <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>
            <strong>Tips pencarian:</strong> Gunakan kata kunci bahasa Inggris untuk hasil lebih banyak. Gunakan tanda kutip untuk frasa tepat, contoh: <em>"machine learning" education</em>. Paper dengan ikon 🔓 tersedia PDF gratis.
          </div>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3 animate-pulse">🔍</div>
            <p className="text-sm" style={{ color: 'var(--slate)' }}>Mengambil data dari Semantic Scholar...</p>
          </div>
        )}

        {error && !loading && (
          <div className="card p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-semibold mb-1" style={{ color: 'var(--ink)' }}>Terjadi Kendala</p>
            <p className="text-sm" style={{ color: 'var(--slate)' }}>{error}</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && !error && (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-display text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>Tidak ada hasil</p>
            <p className="text-sm" style={{ color: 'var(--slate)' }}>Coba kata kunci yang berbeda atau lebih umum.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-sm mb-5" style={{ color: 'var(--slate)' }}>
              Menampilkan <span className="font-semibold" style={{ color: 'var(--ink)' }}>{results.length}</span> dari sekitar <span className="font-semibold" style={{ color: 'var(--ink)' }}>{total.toLocaleString()}</span> hasil
            </p>

            <div className="space-y-4">
              {results.map((paper) => (
                <div key={paper.id} className="card p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <div className="flex items-start gap-2 mb-2">
                        {paper.isOpenAccess && <span className="text-sm shrink-0 mt-0.5">🔓</span>}
                        <h3 className="font-semibold text-base leading-snug" style={{ color: 'var(--ink)', fontFamily: 'Lora, serif' }}>
                          {paper.pdfUrl ? (
                            <a href={paper.pdfUrl} target="_blank" rel="noopener" className="hover:underline" style={{ color: 'var(--teal)' }}>
                              {paper.title}
                            </a>
                          ) : paper.title}
                        </h3>
                      </div>

                      {/* Meta */}
                      <p className="text-xs mb-1" style={{ color: 'var(--teal)' }}>{paper.authors}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs mb-3" style={{ color: 'var(--slate)' }}>
                        {paper.year && <span>📅 {paper.year}</span>}
                        {paper.venue && <span>📰 {paper.venue}</span>}
                        <span>💬 {paper.citationCount.toLocaleString()} sitasi</span>
                        {paper.doi && (
                          <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener"
                            className="hover:underline" style={{ color: 'var(--teal)' }}>
                            DOI: {paper.doi}
                          </a>
                        )}
                      </div>

                      {/* Abstract */}
                      {paper.abstract && (
                        <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--slate)' }}>
                          {paper.abstract}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t flex-wrap" style={{ borderColor: '#f0ece0' }}>
                    {paper.pdfUrl && (
                      <a href={paper.pdfUrl} target="_blank" rel="noopener" className="btn-primary text-xs py-1.5 px-3">
                        ⬇ Unduh PDF
                      </a>
                    )}
                    <a href={`https://www.semanticscholar.org/paper/${paper.id}`} target="_blank" rel="noopener"
                      className="btn-outline text-xs py-1.5 px-3">
                      🔗 Lihat di Semantic Scholar
                    </a>
                    <CiteBadge paper={paper} onCite={saveCitation} />
                    {citedIds.has(paper.id) && (
                      <span className="text-xs" style={{ color: '#166534' }}>✓ Ditambahkan ke koleksi sitasi</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Powered by */}
        <div className="text-center mt-10 text-xs" style={{ color: 'var(--slate)' }}>
          Data disediakan oleh{' '}
          <a href="https://www.semanticscholar.org" target="_blank" rel="noopener" className="underline" style={{ color: 'var(--teal)' }}>
            Semantic Scholar
          </a>
          {' '}— Allen Institute for AI. Gratis untuk penggunaan akademik.
        </div>
      </div>
    </div>
  );
}
