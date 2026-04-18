import Link from 'next/link';
import { prisma } from '@/lib/prisma';

async function getStats() {
  const [resources, users, trainings] = await Promise.all([
    prisma.resource.count(),
    prisma.user.count(),
    prisma.training.count(),
  ]);
  return { resources, users, trainings };
}

async function getFeaturedResources() {
  return prisma.resource.findMany({
    take: 4, where: { isOpenAccess: true },
    orderBy: { downloadCount: 'desc' },
  });
}

const features = [
  { icon: '📖', title: 'Repositori Digital 24/7', desc: 'Akses ribuan e-book, jurnal ilmiah, paper, dan video tutorial kapan saja dan di mana saja — tanpa batas fisik perpustakaan.', href: '/repository', color: 'var(--teal)' },
  { icon: '💬', title: 'Layanan Referensi Virtual', desc: 'Konsultasi langsung dengan pustakawan dan pakar bidang studi melalui chat, video call, atau email. Jawaban cepat, bimbingan mendalam.', href: '/konsultasi', color: 'var(--amber)' },
  { icon: '🎓', title: 'Pelatihan Literasi Digital', desc: 'Webinar dan workshop penelusuran database Scopus/WoS, manajemen referensi Mendeley & Zotero, dan teknik pencarian open access.', href: '/pelatihan', color: '#7c3aed' },
  { icon: '🔬', title: 'Pendampingan Riset', desc: 'Bimbingan jangka panjang dari pemilihan topik, penyusunan proposal, analisis data, penulisan, hingga publikasi di jurnal bereputasi.', href: '/pendampingan', color: 'var(--crimson)' },
];

const typeIcons: Record<string, string> = {
  EBOOK: '📕', JOURNAL: '📄', PAPER: '📑', VIDEO: '🎬', THESIS: '📘',
};

export default async function Home() {
  const [stats, featured] = await Promise.all([getStats(), getFeaturedResources()]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4"
        style={{ background: 'linear-gradient(135deg, var(--ink) 0%, var(--ink-light) 60%, #1a3a4a 100%)' }}>
        {/* Decorative */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, var(--teal) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{ background: 'rgba(13,115,119,0.3)', color: '#5eead4', border: '1px solid rgba(13,115,119,0.4)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Platform Perpustakaan Digital Akademik Indonesia
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            style={{ animationFillMode: 'forwards' }}>
            Satu Platform untuk<br />
            <span style={{ color: 'var(--amber-light)', fontStyle: 'italic' }}>Semua Kebutuhan Risetmu</span>
          </h1>

          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: '#94a3b8' }}>
            Akses e-book & jurnal ilmiah, konsultasi dengan pustakawan & pakar, ikuti pelatihan literasi digital, dan dapatkan pendampingan riset — semuanya dalam genggaman, 24 jam sehari.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link href="/register" className="btn-amber text-base px-8 py-3.5 justify-center">
              Mulai Sekarang — Gratis
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
            <Link href="/repository" className="btn-outline text-base px-8 py-3.5 justify-center" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
              Jelajahi Repositori
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
            {[
              { n: `${stats.resources}+`, label: 'Sumber Digital' },
              { n: `${stats.users}+`, label: 'Pengguna Aktif' },
              { n: `${stats.trainings}+`, label: 'Program Pelatihan' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-bold text-white">{s.n}</div>
                <div className="text-xs mt-1" style={{ color: '#94a3b8' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="rule-amber w-full" style={{ background: 'linear-gradient(90deg, var(--amber), var(--teal), transparent)' }} />

      {/* Features */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--teal)' }}>Layanan Kami</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: 'var(--ink)' }}>
            Empat Pilar Dukungan Akademik
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-base" style={{ color: 'var(--slate)' }}>
            Dirancang khusus berdasarkan kebutuhan nyata mahasiswa dalam proses riset dan penulisan ilmiah.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <Link key={f.href} href={f.href} className="card p-6 block group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ background: `${f.color}18` }}>
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-base mb-2 group-hover:text-teal transition-colors" style={{ color: 'var(--ink)' }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--slate)' }}>{f.desc}</p>
              <div className="mt-4 text-sm font-semibold flex items-center gap-1 transition-colors" style={{ color: f.color }}>
                Selengkapnya
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-16 px-4" style={{ background: 'var(--parchment-dark)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--teal)' }}>Repositori</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: 'var(--ink)' }}>Sumber Belajar Terpopuler</h2>
            </div>
            <Link href="/repository" className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--teal)' }}>
              Lihat semua
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((r) => (
              <Link key={r.id} href={`/repository/${r.id}`} className="card p-5 block group">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{typeIcons[r.type] || '📄'}</span>
                  <span className={`badge-${r.type.toLowerCase()} px-2 py-0.5 rounded-full text-xs font-medium`}
                    style={{ background: '#e8f5f4', color: 'var(--teal)', border: '1px solid #99d4d6' }}>
                    {r.type}
                  </span>
                </div>
                <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-teal transition-colors" style={{ color: 'var(--ink)', fontFamily: 'Lora, serif' }}>
                  {r.title}
                </h3>
                <p className="text-xs mb-3 truncate" style={{ color: 'var(--slate)' }}>{r.authors}</p>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--slate)' }}>
                  <span>{r.year}</span>
                  <span>⬇ {r.downloadCount.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it helps */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--ink)' }}>Dirancang untuk Mahasiswa Peneliti</h2>
          <p className="mt-3 max-w-lg mx-auto" style={{ color: 'var(--slate)' }}>Mulai dari menemukan referensi, menyusun sitasi, hingga mempublikasikan hasil riset.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Temukan Referensi Berkualitas', desc: 'Cari dari ribuan e-book, jurnal Scopus/WoS, paper open access, dan video ilmiah yang terindeks. Filter berdasarkan bidang, tahun, dan bahasa.' },
            { step: '02', title: 'Konsultasi & Pelatihan', desc: 'Tanyakan langsung ke pustakawan virtual atau ikuti webinar literasi digital. Pelajari cara menelusuri database, menggunakan Mendeley/Zotero, dan menulis abstract ilmiah.' },
            { step: '03', title: 'Riset dengan Pendampingan', desc: 'Dapatkan mentor riset yang mendampingi perjalananmu dari perumusan masalah hingga submission ke jurnal bereputasi nasional maupun internasional.' },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-display font-bold text-lg mx-auto mb-4 shadow-lg"
                style={{ background: 'var(--teal)' }}>
                {s.step}
              </div>
              <h3 className="font-display font-semibold mb-3" style={{ color: 'var(--ink)' }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--slate)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto rounded-2xl p-10 sm:p-14 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--teal) 0%, #0a5a5e 100%)' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">Mulai Riset Lebih Cerdas Hari Ini</h2>
            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Daftar gratis dan dapatkan akses langsung ke repositori digital, layanan konsultasi, dan komunitas akademik.
            </p>
            <Link href="/register" className="btn-amber px-10 py-4 text-base justify-center inline-flex">
              Daftar Sekarang — Gratis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
