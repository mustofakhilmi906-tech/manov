'use client';
import { useState } from 'react';

type Props = {
  resource: { id: string; title: string; authors: string; year: number | null; publisher: string | null; doi: string | null };
  isLoggedIn: boolean;
};

function formatCitation(r: Props['resource'], style: string): string {
  const year = r.year ? `(${r.year})` : '';
  const doi = r.doi ? ` https://doi.org/${r.doi}` : '';
  switch (style) {
    case 'APA': return `${r.authors}. ${year}. ${r.title}. ${r.publisher || ''}.${doi}`;
    case 'MLA': return `${r.authors}. "${r.title}." ${r.publisher || ''}, ${r.year || ''}.${doi}`;
    case 'Chicago': return `${r.authors}. ${r.title}. ${r.publisher || ''}, ${r.year || ''}.${doi}`;
    case 'Vancouver': return `${r.authors}. ${r.title}. ${r.publisher || ''}. ${r.year || ''}.${doi}`;
    case 'IEEE': return `${r.authors}, "${r.title}," ${r.publisher || ''}, ${r.year || ''}.${doi}`;
    default: return '';
  }
}

export default function CitationBox({ resource, isLoggedIn }: Props) {
  const [style, setStyle] = useState('APA');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const citation = formatCitation(resource, style);

  const copy = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveCitation = async () => {
    if (!isLoggedIn) return;
    setSaving(true);
    await fetch('/api/citations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceId: resource.id, title: resource.title, authors: resource.authors, year: resource.year, publisher: resource.publisher, doi: resource.doi, style, formatted: citation }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="card p-6">
      <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--ink)' }}>Format Sitasi Otomatis</h2>
      <div className="flex gap-2 mb-4 flex-wrap">
        {['APA', 'MLA', 'Chicago', 'Vancouver', 'IEEE'].map((s) => (
          <button key={s} onClick={() => setStyle(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
            style={style === s ? { background: 'var(--teal)', color: 'white', borderColor: 'var(--teal)' } : { color: 'var(--ink-muted)', borderColor: '#d1d5db' }}>
            {s}
          </button>
        ))}
      </div>
      <div className="p-4 rounded-xl text-sm leading-relaxed mb-4 font-mono"
        style={{ background: 'var(--parchment-dark)', color: 'var(--ink)', border: '1px solid #e8e4d8', lineHeight: '1.7' }}>
        {citation}
      </div>
      <div className="flex gap-3">
        <button onClick={copy} className="btn-outline text-sm flex-1 justify-center">
          {copied ? '✓ Tersalin!' : '📋 Salin'}
        </button>
        {isLoggedIn && (
          <button onClick={saveCitation} disabled={saving} className="btn-primary text-sm flex-1 justify-center">
            {saved ? '✓ Tersimpan!' : saving ? 'Menyimpan...' : '💾 Simpan ke Koleksiku'}
          </button>
        )}
      </div>
    </div>
  );
}
