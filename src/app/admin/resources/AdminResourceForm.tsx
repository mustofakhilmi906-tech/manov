'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Resource = {
  id: string; title: string; authors: string; abstract: string; type: string; category: string;
  subject?: string | null; publisher?: string | null; year?: number | null; doi?: string | null;
  fileUrl?: string | null; language: string; isOpenAccess: boolean; isPremium: boolean; tags?: string | null;
};

const TYPES = ['EBOOK', 'JOURNAL', 'PAPER', 'VIDEO', 'THESIS'];
const CATEGORIES = ['Metodologi', 'Teknologi', 'Hukum', 'Kedokteran', 'Ekonomi', 'Lingkungan', 'Literasi Digital', 'Penulisan Ilmiah', 'Sains', 'Sosial', 'Lainnya'];

export default function AdminResourceForm({ resource }: { resource?: Resource }) {
  const router = useRouter();
  const isEdit = !!resource;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Resource>>(resource || {
    type: 'JOURNAL', category: 'Metodologi', language: 'Indonesia', isOpenAccess: true, isPremium: false,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(isEdit ? `/api/admin/resources/${resource!.id}` : '/api/admin/resources', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, year: form.year ? parseInt(String(form.year)) : null }),
      });
      if (res.ok) { setOpen(false); router.refresh(); }
    } finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className={isEdit ? 'text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors hover:bg-teal-50' : 'btn-primary text-sm'}
        style={isEdit ? { borderColor: 'var(--teal)', color: 'var(--teal)' } : {}}>
        {isEdit ? 'Edit' : '+ Tambah Sumber'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-y-auto max-h-[90vh]" style={{ border: '1px solid #e8e4d8' }}>
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10" style={{ borderColor: '#e8e4d8' }}>
              <h3 className="font-display text-lg font-bold" style={{ color: 'var(--ink)' }}>{isEdit ? 'Edit Sumber' : 'Tambah Sumber Baru'}</h3>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-gray-100">✕</button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Judul *</label>
                  <input required value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} className="input-base" placeholder="Judul lengkap" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Penulis/Author *</label>
                  <input required value={form.authors || ''} onChange={e => setForm({...form, authors: e.target.value})} className="input-base" placeholder="Nama penulis, dipisah koma" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Tipe *</label>
                  <select required value={form.type || 'JOURNAL'} onChange={e => setForm({...form, type: e.target.value})} className="input-base">
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Kategori *</label>
                  <select required value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} className="input-base">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Tahun</label>
                  <input type="number" value={form.year || ''} onChange={e => setForm({...form, year: Number(e.target.value)})} className="input-base" placeholder="2024" min="1900" max="2030" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Bahasa</label>
                  <select value={form.language || 'Indonesia'} onChange={e => setForm({...form, language: e.target.value})} className="input-base">
                    <option>Indonesia</option><option>Inggris</option><option>Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Penerbit</label>
                  <input value={form.publisher || ''} onChange={e => setForm({...form, publisher: e.target.value})} className="input-base" placeholder="Nama penerbit / jurnal" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>DOI</label>
                  <input value={form.doi || ''} onChange={e => setForm({...form, doi: e.target.value})} className="input-base" placeholder="10.1234/example" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>URL File / Link</label>
                  <input value={form.fileUrl || ''} onChange={e => setForm({...form, fileUrl: e.target.value})} className="input-base" placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Abstrak *</label>
                  <textarea required rows={4} value={form.abstract || ''} onChange={e => setForm({...form, abstract: e.target.value})} className="input-base resize-none" placeholder="Abstrak / deskripsi singkat..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Tags (pisah koma)</label>
                  <input value={form.tags || ''} onChange={e => setForm({...form, tags: e.target.value})} className="input-base" placeholder="riset,metodologi,kualitatif" />
                </div>
                <div className="col-span-2 flex gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.isOpenAccess || false} onChange={e => setForm({...form, isOpenAccess: e.target.checked})} className="w-4 h-4 rounded" />
                    <span style={{ color: 'var(--ink)' }}>Open Access (gratis)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.isPremium || false} onChange={e => setForm({...form, isPremium: e.target.checked})} className="w-4 h-4 rounded" />
                    <span style={{ color: 'var(--ink)' }}>Konten Premium</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-outline flex-1 justify-center">Batal</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                  {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Sumber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function DeleteResourceButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const del = async () => {
    if (!confirm(`Hapus "${title}"?`)) return;
    setLoading(true);
    await fetch(`/api/admin/resources/${id}`, { method: 'DELETE' });
    setLoading(false);
    router.refresh();
  };

  return (
    <button onClick={del} disabled={loading}
      className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors hover:bg-red-50 disabled:opacity-50"
      style={{ borderColor: '#fecaca', color: '#be123c' }}>
      {loading ? '...' : 'Hapus'}
    </button>
  );
}
