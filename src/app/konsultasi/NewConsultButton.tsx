'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewConsultButton({
  expertId, expertName, primary,
}: { expertId?: string; expertName?: string; primary?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ topic: '', description: '', channel: 'CHAT', pakarId: expertId || '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await fetch('/api/consultations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, pakarId: expertId || form.pakarId }),
    });
    setLoading(false); setSuccess(true);
    setTimeout(() => { setOpen(false); setSuccess(false); router.refresh(); }, 1800);
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className={primary ? 'btn-primary text-sm' : 'text-xs font-semibold'}
        style={!primary ? { color: 'var(--teal)' } : {}}>
        {primary ? '+ Konsultasi Baru' : 'Konsultasi →'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6" style={{ border: '1px solid #e8e4d8' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-lg font-bold" style={{ color: 'var(--ink)' }}>Ajukan Konsultasi</h3>
                {expertName && <p className="text-sm" style={{ color: 'var(--slate)' }}>kepada {expertName}</p>}
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-gray-100">✕</button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">✅</div>
                <p className="font-semibold" style={{ color: 'var(--ink)' }}>Konsultasi berhasil diajukan!</p>
                <p className="text-sm mt-1" style={{ color: 'var(--slate)' }}>Ahli akan merespons dalam 1×24 jam.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Topik Konsultasi</label>
                  <input type="text" required value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    placeholder="e.g. Strategi pencarian jurnal untuk systematic review" className="input-base" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Deskripsi Kebutuhan</label>
                  <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Jelaskan konteks penelitian, apa yang sudah kamu coba, dan apa yang kamu butuhkan..."
                    className="input-base resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Saluran Komunikasi</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ v: 'CHAT', l: '💬 Chat' }, { v: 'VIDEO', l: '🎥 Video Call' }, { v: 'EMAIL', l: '📧 Email' }].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => setForm({ ...form, channel: v })}
                        className="py-2 rounded-lg text-xs font-medium border transition-all"
                        style={form.channel === v ? { borderColor: 'var(--teal)', background: 'var(--teal-pale)', color: 'var(--teal)' } : { borderColor: '#d1d5db', color: 'var(--ink-muted)' }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? 'Mengirim...' : 'Kirim Konsultasi'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
