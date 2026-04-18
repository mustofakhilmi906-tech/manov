'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Training = {
  id: string; title: string; description: string; type: string; topic: string;
  instructor: string; duration?: number | null; maxParticipants?: number | null;
  materialUrl?: string | null; isPublished: boolean;
};

const TYPES = ['WEBINAR', 'WORKSHOP', 'MODUL', 'VIDEO'];
const TOPICS = ['Penelusuran Database', 'Mendeley', 'Zotero', 'Academic Writing', 'Open Access', 'Systematic Review', 'Statistik', 'Lainnya'];

export default function AdminTrainingForm({ training }: { training?: Training }) {
  const router = useRouter();
  const isEdit = !!training;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Training>>(training || {
    type: 'WEBINAR', topic: 'Penelusuran Database', isPublished: true,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(isEdit ? `/api/admin/trainings/${training!.id}` : '/api/admin/trainings', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          duration: form.duration ? parseInt(String(form.duration)) : null,
          maxParticipants: form.maxParticipants ? parseInt(String(form.maxParticipants)) : null,
        }),
      });
      if (res.ok) { setOpen(false); router.refresh(); }
    } finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className={isEdit ? 'text-xs font-semibold px-2.5 py-1 rounded-lg border' : 'btn-primary text-sm'}
        style={isEdit ? { borderColor: 'var(--teal)', color: 'var(--teal)' } : {}}>
        {isEdit ? 'Edit' : '+ Tambah Pelatihan'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-y-auto max-h-[90vh]" style={{ border: '1px solid #e8e4d8' }}>
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: '#e8e4d8' }}>
              <h3 className="font-display text-lg font-bold" style={{ color: 'var(--ink)' }}>{isEdit ? 'Edit Pelatihan' : 'Tambah Pelatihan'}</h3>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-gray-100">✕</button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Judul *</label>
                <input required value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} className="input-base" placeholder="Judul program pelatihan" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Deskripsi *</label>
                <textarea required rows={3} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className="input-base resize-none" placeholder="Deskripsi program..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Tipe</label>
                  <select value={form.type || 'WEBINAR'} onChange={e => setForm({...form, type: e.target.value})} className="input-base">
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Topik</label>
                  <select value={form.topic || ''} onChange={e => setForm({...form, topic: e.target.value})} className="input-base">
                    {TOPICS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Instruktur</label>
                  <input required value={form.instructor || ''} onChange={e => setForm({...form, instructor: e.target.value})} className="input-base" placeholder="Nama instruktur" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Durasi (menit)</label>
                  <input type="number" value={form.duration || ''} onChange={e => setForm({...form, duration: Number(e.target.value)})} className="input-base" placeholder="90" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Maks. Peserta</label>
                  <input type="number" value={form.maxParticipants || ''} onChange={e => setForm({...form, maxParticipants: Number(e.target.value)})} className="input-base" placeholder="Opsional" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Link Materi</label>
                  <input value={form.materialUrl || ''} onChange={e => setForm({...form, materialUrl: e.target.value})} className="input-base" placeholder="https://..." />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isPublished || false} onChange={e => setForm({...form, isPublished: e.target.checked})} className="w-4 h-4" />
                <span style={{ color: 'var(--ink)' }}>Publikasikan sekarang</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-outline flex-1 justify-center">Batal</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                  {loading ? 'Menyimpan...' : isEdit ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
