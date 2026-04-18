'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const res = await signIn('credentials', { ...form, redirect: false });
    setLoading(false);
    if (res?.ok) { router.push('/dashboard'); router.refresh(); }
    else setError('Email atau password tidak valid.');
  };

  const fill = (email: string, pw: string) => setForm({ email, password: pw });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--parchment)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-display font-bold" style={{ background: 'var(--teal)' }}>J</div>
            <span className="font-display font-bold text-2xl" style={{ color: 'var(--teal)' }}>JagoIlmiah</span>
          </Link>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Masuk ke Akun</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--slate)' }}>Akses repositori dan layanan akademik</p>
        </div>

        <div className="card p-8">
          {/* Demo accounts */}
          <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--parchment)', border: '1px solid #e8e4d8' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--slate)' }}>Demo — klik untuk mengisi otomatis:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Mahasiswa', email: 'siti@jagoilmiah.id', pw: 'mhs123' },
                { label: 'Pustakawan', email: 'ibu.ratna@jagoilmiah.id', pw: 'pakar123' },
              ].map(({ label, email, pw }) => (
                <button key={label} onClick={() => fill(email, pw)}
                  className="py-1.5 rounded-lg text-xs font-medium border transition-colors"
                  style={{ borderColor: 'var(--teal)', color: 'var(--teal)' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nama@email.com" className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-muted)' }}>Password</label>
              <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" className="input-base" />
            </div>
            {error && <p className="text-sm p-3 rounded-lg" style={{ background: '#fef2f2', color: 'var(--crimson)', border: '1px solid #fecaca' }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--slate)' }}>
            Belum punya akun?{' '}
            <Link href="/register" className="font-semibold" style={{ color: 'var(--teal)' }}>Daftar gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
