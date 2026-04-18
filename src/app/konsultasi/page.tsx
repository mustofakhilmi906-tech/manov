import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { formatDateShort, ROLE_LABELS } from '@/lib/utils';
import NewConsultButton from './NewConsultButton';
import Link from 'next/link';

async function getExperts() {
  return prisma.user.findMany({
    where: { role: { in: ['PUSTAKAWAN', 'PAKAR'] } },
    select: {
      id: true, name: true, role: true, bio: true, prodi: true, institusi: true,
      consultAsExpert: { select: { id: true }, where: { status: 'RESOLVED' } },
    },
  });
}

async function getUserConsultations(userId: string) {
  return prisma.consultation.findMany({
    where: { mahasiswaId: userId },
    include: {
      pakar: { select: { name: true, role: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

const STATUS_META: Record<string, { label: string; style: string }> = {
  OPEN:        { label: 'Menunggu Respons', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  IN_PROGRESS: { label: 'Sedang Ditangani', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  RESOLVED:    { label: 'Selesai', style: 'bg-green-50 text-green-700 border-green-200' },
  CLOSED:      { label: 'Ditutup', style: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export default async function KonsultasiPage() {
  const session = await getServerSession(authOptions);
  const experts = await getExperts();
  const consultations = session ? await getUserConsultations((session.user as any).id) : [];
  const role = (session?.user as any)?.role;

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--parchment)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--teal)' }}>Layanan Referensi Virtual</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--ink)' }}>
            Konsultasi dengan Pustakawan & Pakar
          </h1>
          <p className="text-base max-w-2xl" style={{ color: 'var(--slate)' }}>
            Tanyakan pertanyaan riset, minta panduan menelusuri database, atau diskusikan topik penelitianmu langsung dengan ahlinya.
          </p>
        </div>

        {/* How it works */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: '✍️', title: 'Ajukan Pertanyaan', desc: 'Deskripsikan kebutuhan informasi atau topik risetmu secara detail.' },
            { icon: '👩‍💼', title: 'Direspons Ahli', desc: 'Pustakawan atau pakar bidang studi akan merespons dalam 1×24 jam.' },
            { icon: '🎯', title: 'Masalah Terpecahkan', desc: 'Dapatkan panduan, sumber referensi, dan solusi yang tepat sasaran.' },
          ].map((s) => (
            <div key={s.title} className="card p-5 flex gap-4">
              <span className="text-2xl shrink-0">{s.icon}</span>
              <div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--ink)' }}>{s.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--slate)' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Expert list */}
          <div className="lg:col-span-1">
            <h2 className="font-display font-semibold text-lg mb-5" style={{ color: 'var(--ink)' }}>Tim Ahli Kami</h2>
            <div className="space-y-4">
              {experts.map((e) => (
                <div key={e.id} className="card p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                      style={{ background: e.role === 'PUSTAKAWAN' ? 'var(--teal)' : 'var(--amber)' }}>
                      {e.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--ink)' }}>{e.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={e.role === 'PUSTAKAWAN'
                          ? { background: 'var(--teal-pale)', color: 'var(--teal)' }
                          : { background: 'var(--amber-pale)', color: 'var(--amber)' }}>
                        {ROLE_LABELS[e.role]}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed mb-3 line-clamp-3" style={{ color: 'var(--slate)' }}>{e.bio}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--slate)' }}>✅ {e.consultAsExpert.length} konsultasi selesai</span>
                    {session && role === 'MAHASISWA' && (
                      <NewConsultButton expertId={e.id} expertName={e.name} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User's consultations */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--ink)' }}>
                {session ? 'Riwayat Konsultasi Saya' : 'Mulai Konsultasi'}
              </h2>
              {session && role === 'MAHASISWA' && (
                <NewConsultButton expertId={experts[0]?.id} expertName={experts[0]?.name} primary />
              )}
            </div>

            {!session ? (
              <div className="card p-12 text-center">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>Masuk untuk Mulai Konsultasi</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--slate)' }}>Buat akun gratis dan akses layanan referensi virtual dari pustakawan ahli.</p>
                <Link href="/register" className="btn-primary">Daftar Gratis</Link>
              </div>
            ) : consultations.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>Belum Ada Konsultasi</h3>
                <p className="text-sm" style={{ color: 'var(--slate)' }}>Pilih salah satu ahli di sebelah kiri dan mulai konsultasi pertamamu.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {consultations.map((c) => {
                  const sm = STATUS_META[c.status] || STATUS_META.OPEN;
                  const lastMsg = c.messages[0];
                  return (
                    <div key={c.id} className="card p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${sm.style}`}>{sm.label}</span>
                            <span className="text-xs" style={{ color: 'var(--slate)' }}>dengan {c.pakar.name}</span>
                          </div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--ink)', fontFamily: 'Lora, serif' }}>{c.topic}</p>
                        </div>
                        <span className="text-xl shrink-0">{c.channel === 'CHAT' ? '💬' : c.channel === 'VIDEO' ? '🎥' : '📧'}</span>
                      </div>
                      {lastMsg && (
                        <div className="p-3 rounded-lg text-xs leading-relaxed line-clamp-2" style={{ background: 'var(--parchment)', color: 'var(--slate)', border: '1px solid #e8e4d8' }}>
                          {lastMsg.content}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs" style={{ color: 'var(--slate)' }}>
                          {c.messages.length} pesan
                        </span>
                        {c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                          <Link href={`/konsultasi/${c.id}`} className="text-xs font-semibold" style={{ color: 'var(--teal)' }}>
                            Lihat percakapan →
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
