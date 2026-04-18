import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import ChatWindow from './ChatWindow';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

const STATUS_META: Record<string, { label: string; style: string }> = {
  OPEN:        { label: 'Menunggu Respons', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  IN_PROGRESS: { label: 'Sedang Ditangani', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  RESOLVED:    { label: 'Selesai',           style: 'bg-green-50 text-green-700 border-green-200' },
  CLOSED:      { label: 'Ditutup',           style: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export default async function ConsultationDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = (session.user as any).id;
  const consultation = await prisma.consultation.findUnique({
    where: { id: params.id },
    include: {
      mahasiswa: { select: { id: true, name: true, prodi: true, institusi: true } },
      pakar:     { select: { id: true, name: true, role: true, bio: true } },
      chatMessages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!consultation) notFound();

  // Only allow participants
  if (consultation.mahasiswaId !== userId && consultation.pakarId !== userId) {
    redirect('/konsultasi');
  }

  const sm = STATUS_META[consultation.status] || STATUS_META.OPEN;
  const isExpert = consultation.pakarId === userId;

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--parchment)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-5" style={{ color: 'var(--slate)' }}>
          <Link href="/konsultasi" style={{ color: 'var(--teal)' }} className="hover:underline">Konsultasi</Link>
          <span>/</span>
          <span className="truncate max-w-xs">{consultation.topic}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar info */}
          <div className="space-y-4 order-2 lg:order-1">
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--ink)' }}>Detail Konsultasi</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--slate)' }}>Status</p>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${sm.style}`}>{sm.label}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--slate)' }}>Topik</p>
                  <p className="text-sm leading-snug" style={{ color: 'var(--ink)', fontFamily: 'Lora, serif' }}>{consultation.topic}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--slate)' }}>Saluran</p>
                  <p className="text-sm" style={{ color: 'var(--ink)' }}>
                    {consultation.channel === 'CHAT' ? '💬 Chat' : consultation.channel === 'VIDEO' ? '🎥 Video Call' : '📧 Email'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--slate)' }}>Dibuka</p>
                  <p className="text-sm" style={{ color: 'var(--ink)' }}>{formatDate(consultation.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Participant info */}
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--ink)' }}>
                {isExpert ? 'Mahasiswa' : 'Pakar / Pustakawan'}
              </h3>
              {isExpert ? (
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--ink)' }}>{consultation.mahasiswa.name}</p>
                  {consultation.mahasiswa.prodi && <p className="text-xs" style={{ color: 'var(--slate)' }}>{consultation.mahasiswa.prodi}</p>}
                  {consultation.mahasiswa.institusi && <p className="text-xs" style={{ color: 'var(--slate)' }}>{consultation.mahasiswa.institusi}</p>}
                </div>
              ) : (
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--ink)' }}>{consultation.pakar.name}</p>
                  <p className="text-xs" style={{ color: 'var(--slate)' }}>{consultation.pakar.role === 'PUSTAKAWAN' ? 'Pustakawan' : 'Pakar / Dosen'}</p>
                  {consultation.pakar.bio && <p className="text-xs mt-1 line-clamp-3" style={{ color: 'var(--slate)' }}>{consultation.pakar.bio}</p>}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--ink)' }}>Deskripsi Awal</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--slate)' }}>{consultation.description}</p>
            </div>
          </div>

          {/* Chat window */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <ChatWindow
              consultationId={consultation.id}
              initialMessages={consultation.chatMessages.map(m => ({
                id: m.id,
                senderId: m.senderId,
                senderName: m.senderName,
                senderRole: m.senderRole,
                content: m.content,
                createdAt: m.createdAt.toISOString(),
              }))}
              currentUserId={userId}
              currentUserName={session.user?.name || ''}
              currentUserRole={(session.user as any).role}
              isResolved={consultation.status === 'RESOLVED' || consultation.status === 'CLOSED'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
