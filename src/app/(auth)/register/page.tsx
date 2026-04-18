'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MAHASISWA', prodi: '', institusi: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const login = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      if (login?.ok) { router.push('/dashboard'); router.refresh(); }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--parchment)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-display font-bold" style={{ background: 'var(--teal)' }}>J</div>
            <span className="font-display font-bold text-2xl" style={{ color: 'var(--teal)' }}>JagoIlmiah</span>
          </Link>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Buat Akun Baru</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--slate)' }}>Gratis untuk mahasiswa dan akademisi</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Nama Lengkap</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap kamu" className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Password</label>
              <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimal 6 karakter" className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Saya adalah</label>
              <div className="grid grid-cols-3 gap-2">
                {[{ v: 'MAHASISWA', l: '🎓 Mahasiswa' }, { v: 'PUSTAKAWAN', l: '📚 Pustakawan' }, { v: 'PAKAR', l: '🔬 Pakar/Dosen' }].map(({ v, l }) => (
                  <button key={v} type="button" onClick={() => setForm({ ...form, role: v })}
                    className="py-2 rounded-lg text-xs font-medium border transition-all"
                    style={form.role === v ? { borderColor: 'var(--teal)', background: 'var(--teal-pale)', color: 'var(--teal)' } : { borderColor: '#d1d5db', color: 'var(--ink-muted)' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Program Studi</label>
                <input type="text" value={form.prodi} onChange={(e) => setForm({ ...form, prodi: e.target.value })} placeholder="e.g. Kedokteran" className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Institusi</label>
                <input type="text" value={form.institusi} onChange={(e) => setForm({ ...form, institusi: e.target.value })} placeholder="e.g. UI, ITB" className="input-base" />
              </div>
            </div>
            {error && <p className="text-sm p-3 rounded-lg" style={{ background: '#fef2f2', color: 'var(--crimson)', border: '1px solid #fecaca' }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60 mt-2">
              {loading ? 'Membuat akun...' : 'Daftar Sekarang'}
            </button>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: 'var(--slate)' }}>
            Sudah punya akun? <Link href="/login" className="font-semibold" style={{ color: 'var(--teal)' }}>Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
