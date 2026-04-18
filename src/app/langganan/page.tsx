'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PLANS = [
  {
    key: 'FREE',
    name: 'Gratis',
    price: 0,
    period: 'Selamanya',
    color: 'slate',
    badge: '',
    desc: 'Mulai eksplorasi platform tanpa biaya',
    features: [
      { text: 'Repositori open access', ok: true },
      { text: '2 konsultasi per bulan', ok: true },
      { text: '2 pelatihan literasi digital', ok: true },
      { text: 'Format sitasi otomatis (APA/MLA)', ok: true },
      { text: 'Repositori premium & jurnal internasional', ok: false },
      { text: 'Konsultasi unlimited', ok: false },
      { text: 'Pendampingan riset', ok: false },
      { text: 'Akses Semantic Scholar terintegrasi', ok: false },
    ],
  },
  {
    key: 'PELAJAR',
    name: 'Pelajar',
    price: 29000,
    period: '/bulan',
    color: 'teal',
    badge: '',
    desc: 'Untuk mahasiswa yang ingin belajar lebih dalam',
    features: [
      { text: 'Semua fitur Gratis', ok: true },
      { text: 'Seluruh repositori premium', ok: true },
      { text: 'Konsultasi pustakawan unlimited', ok: true },
      { text: 'Semua program pelatihan', ok: true },
      { text: 'Akses jurnal internasional (Semantic Scholar)', ok: true },
      { text: 'Simpan & ekspor sitasi tak terbatas', ok: true },
      { text: 'Pendampingan riset dasar (1 sesi/bulan)', ok: true },
      { text: 'Pendampingan skripsi penuh', ok: false },
    ],
  },
  {
    key: 'PENELITI',
    name: 'Peneliti',
    price: 59000,
    period: '/bulan',
    color: 'amber',
    badge: '⭐ Terpopuler',
    desc: 'Untuk mahasiswa aktif riset & penulis jurnal',
    features: [
      { text: 'Semua fitur Pelajar', ok: true },
      { text: 'Pendampingan riset unlimited', ok: true },
      { text: 'Prioritas respons pakar (< 4 jam)', ok: true },
      { text: 'Review draft karya ilmiah', ok: true },
      { text: 'Konsultasi video call prioritas', ok: true },
      { text: 'Akses database Semantic Scholar penuh', ok: true },
      { text: 'Sertifikat penyelesaian pelatihan', ok: true },
      { text: 'Pendampingan skripsi penuh', ok: false },
    ],
  },
  {
    key: 'SKRIPSI',
    name: 'Skripsi Selesai',
    price: 1500000,
    period: '/ 6 bulan',
    color: 'crimson',
    badge: '🎓 Spesial',
    desc: 'Pendampingan skripsi dari BAB I sampai sidang lulus',
    features: [
      { text: 'Semua fitur Peneliti', ok: true },
      { text: '1 mentor skripsi dedikasi penuh', ok: true },
      { text: 'Revisi naskah unlimited', ok: true },
      { text: 'Review BAB I–V + daftar pustaka', ok: true },
      { text: 'Simulasi sidang & persiapan presentasi', ok: true },
      { text: 'Bantuan submit ke jurnal (nilai tambah)', ok: true },
      { text: 'Garansi pendampingan hingga lulus sidang', ok: true },
      { text: 'Durasi maksimal 6 bulan', ok: true },
    ],
  },
];

const PLAN_STYLES: Record<string, { headerBg: string; headerColor: string; btn: string; checkColor: string; badgeBg: string }> = {
  slate: {
    headerBg: '#f8fafc', headerColor: '#1e293b',
    btn: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
    checkColor: '#64748b', badgeBg: '',
  },
  teal: {
    headerBg: 'var(--teal-pale)', headerColor: 'var(--teal)',
    btn: 'bg-teal text-white hover:opacity-90',
    checkColor: 'var(--teal)', badgeBg: 'var(--teal-pale)',
  },
  amber: {
    headerBg: 'var(--amber-pale)', headerColor: 'var(--amber)',
    btn: 'bg-amber text-white hover:opacity-90',
    checkColor: 'var(--amber)', badgeBg: 'var(--amber-pale)',
  },
  crimson: {
    headerBg: '#fff1f0', headerColor: '#be123c',
    btn: 'bg-rose-600 text-white hover:bg-rose-700',
    checkColor: '#be123c', badgeBg: '#fff1f0',
  },
};

function formatRp(n: number) {
  if (n === 0) return 'Gratis';
  return 'Rp ' + n.toLocaleString('id-ID');
}

export default function LanggananPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const subscribe = async (planKey: string) => {
    if (!session) { router.push('/login'); return; }
    setLoading(planKey);
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      if (res.ok) {
        setSuccess(planKey);
        setTimeout(() => { router.push('/dashboard'); }, 2000);
      }
    } finally { setLoading(null); }
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--parchment)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--teal)' }}>Harga Transparan</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--ink)' }}>
            Investasi Terbaik untuk<br className="hidden sm:block" /> Perjalanan Akademikmu
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--slate)' }}>
            Mulai gratis, upgrade kapan saja. Harga dirancang khusus agar terjangkau untuk mahasiswa Indonesia.
          </p>
        </div>

        {/* Plans */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-16">
          {PLANS.map((plan) => {
            const s = PLAN_STYLES[plan.color];
            const isSuccess = success === plan.key;
            return (
              <div key={plan.key} className={`card flex flex-col overflow-hidden relative ${plan.key === 'PENELITI' ? 'ring-2' : ''}`}
                style={plan.key === 'PENELITI' ? { ringColor: 'var(--amber)' } : {}}>

                {plan.badge && (
                  <div className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: s.badgeBg, color: s.headerColor }}>
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div className="p-6 pb-4" style={{ background: s.headerBg }}>
                  <h2 className="font-display text-xl font-bold mb-1" style={{ color: s.headerColor }}>{plan.name}</h2>
                  <p className="text-xs mb-4" style={{ color: 'var(--slate)' }}>{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="font-display text-3xl font-bold" style={{ color: s.headerColor }}>
                      {formatRp(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm pb-0.5" style={{ color: 'var(--slate)' }}>{plan.period}</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="p-6 flex-1">
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-2.5 text-sm" style={{ color: f.ok ? 'var(--ink)' : '#94a3b8' }}>
                        <span className="shrink-0 mt-0.5 text-sm" style={{ color: f.ok ? s.checkColor : '#cbd5e1' }}>
                          {f.ok ? '✓' : '✕'}
                        </span>
                        {f.text}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  {isSuccess ? (
                    <div className="w-full py-3 rounded-xl text-center text-sm font-semibold"
                      style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                      ✓ Berhasil! Mengalihkan...
                    </div>
                  ) : (
                    <button
                      onClick={() => subscribe(plan.key)}
                      disabled={loading === plan.key}
                      className={`w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${s.btn}`}
                      style={plan.color !== 'slate' ? {
                        background: plan.color === 'teal' ? 'var(--teal)' : plan.color === 'amber' ? 'var(--amber)' : '#be123c',
                        color: 'white',
                      } : {}}>
                      {loading === plan.key ? 'Memproses...' : plan.price === 0 ? 'Mulai Gratis' : `Pilih ${plan.name}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison note */}
        <div className="card p-8 mb-10">
          <h2 className="font-display text-2xl font-bold text-center mb-8" style={{ color: 'var(--ink)' }}>
            Mengapa Paket Skripsi Selesai Rp 1.500.000?
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { label: 'Jasa konsultan skripsi di luar', value: 'Rp 5–15 juta', sub: 'Tidak transparan, rawan ghostwriter' },
              { label: 'JagoIlmiah Skripsi Selesai', value: 'Rp 1.500.000', sub: 'Pendampingan etis, mentor terverifikasi', highlight: true },
              { label: 'Tanpa bimbingan', value: 'Waktu terbuang', sub: 'Revisi berulang, stres, lulus telat' },
            ].map((c) => (
              <div key={c.label} className="p-5 rounded-xl"
                style={c.highlight ? { background: 'var(--teal-pale)', border: '1.5px solid var(--teal)' } : { background: 'var(--parchment-dark)' }}>
                <p className="text-xs mb-2" style={{ color: 'var(--slate)' }}>{c.label}</p>
                <p className="font-display text-2xl font-bold mb-1" style={{ color: c.highlight ? 'var(--teal)' : 'var(--ink)' }}>{c.value}</p>
                <p className="text-xs" style={{ color: 'var(--slate)' }}>{c.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="card p-8">
          <h2 className="font-display text-xl font-bold mb-6 text-center" style={{ color: 'var(--ink)' }}>Pertanyaan Umum</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { q: 'Apakah bisa ganti paket kapan saja?', a: 'Ya. Upgrade bisa langsung aktif. Downgrade berlaku di akhir periode langganan.' },
              { q: 'Bagaimana cara kerja Paket Skripsi Selesai?', a: 'Setelah berlangganan, kamu akan dipasangkan dengan 1 mentor dedikasi dalam 24 jam. Pendampingan berlangsung maksimal 6 bulan.' },
              { q: 'Apakah ada garansi?', a: 'Paket Skripsi Selesai dilengkapi garansi pendampingan hingga kamu lulus sidang dalam periode 6 bulan.' },
              { q: 'Metode pembayaran apa yang tersedia?', a: 'Simulasi pembayaran tersedia di platform. Untuk produksi, dapat diintegrasikan dengan Midtrans/Xendit.' },
            ].map((f) => (
              <div key={f.q} className="p-4 rounded-xl" style={{ background: 'var(--parchment)', border: '1px solid #e8e4d8' }}>
                <p className="font-semibold text-sm mb-1.5" style={{ color: 'var(--ink)' }}>{f.q}</p>
                <p className="text-sm" style={{ color: 'var(--slate)' }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
