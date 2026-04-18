'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { STAGE_LABELS } from '@/lib/utils';

const STAGES = ['TOPIC_SELECTION', 'PROPOSAL', 'DATA_COLLECTION', 'WRITING', 'REVISION', 'PUBLICATION'];

export default function NewSessionButton({ mentorId, mentorName, primary }: { mentorId?: string; mentorName?: string; primary?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', stage: 'TOPIC_SELECTION', targetDate: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await fetch('/api/research', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, mentorId }),
    });
    setLoading(false); setSuccess(true);
    setTimeout(() => { setOpen(false); setSuccess(false); router.refresh(); }, 1800);
  };

  const minDate = new Date(); minDate.setDate(minDate.getDate() + 7);

  return (
    <>
      <button onClick={() => setOpen(true)}
        className={primary ? 'btn-primary text-sm' : 'text-xs font-semibold'}
        style={!primary ? { color: 'var(--teal)' } : {}}>
        {primary ? '+ Sesi Baru' : 'Pilih Mentor →'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 overflow-y-auto max-h-[90vh]" style={{ border: '1px solid #e8e4d8' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-lg font-bold" style={{ color: 'var(--ink)' }}>Mulai Sesi Pendampingan</h3>
                {mentorName && <p className="text-sm" style={{ color: 'var(--slate)' }}>Mentor: {mentorName}</p>}
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-gray-100">✕</button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🎉</div>
                <p className="font-semibold" style={{ color: 'var(--ink)' }}>Sesi pendampingan berhasil dibuat!</p>
                <p className="text-sm mt-1" style={{ color: 'var(--slate)' }}>Mentor akan segera menghubungimu.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Judul / Topik Penelitian</label>
                  <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Analisis Persepsi Pasien terhadap Telemedicine" className="input-base" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Deskripsi Singkat</label>
                  <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Jelaskan latar belakang, tujuan, dan apa yang kamu harapkan dari pendampingan ini..."
                    className="input-base resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Tahap Penelitian Saat Ini</label>
                  <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="input-base">
                    {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Target Selesai (opsional)</label>
                  <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                    min={minDate.toISOString().split('T')[0]} className="input-base" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? 'Membuat sesi...' : '🔬 Mulai Pendampingan'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
