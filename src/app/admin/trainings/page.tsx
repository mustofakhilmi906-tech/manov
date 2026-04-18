import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminTrainingForm from './AdminTrainingForm';

const TYPE_STYLE: Record<string, string> = {
  WEBINAR:  'bg-teal-50 text-teal-700 border-teal-200',
  WORKSHOP: 'bg-amber-50 text-amber-700 border-amber-200',
  MODUL:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  VIDEO:    'bg-purple-50 text-purple-700 border-purple-200',
};

export default async function AdminTrainingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/');

  const trainings = await prisma.training.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { enrollments: true } } },
  });

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--parchment)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/admin/dashboard" className="text-xs mb-1 block hover:underline" style={{ color: 'var(--teal)' }}>← Dashboard Admin</a>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Kelola Program Pelatihan</h1>
          </div>
          <AdminTrainingForm />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trainings.map(t => (
            <div key={t.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${TYPE_STYLE[t.type] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {t.type}
                </span>
                <div className="flex gap-2">
                  <AdminTrainingForm training={t} />
                </div>
              </div>
              <h3 className="font-semibold text-sm leading-snug mb-2" style={{ color: 'var(--ink)', fontFamily: 'Lora, serif' }}>{t.title}</h3>
              <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--slate)' }}>{t.description}</p>
              <div className="space-y-1 text-xs" style={{ color: 'var(--slate)' }}>
                <p>👤 {t.instructor}</p>
                <p>🏷 {t.topic}</p>
                {t.duration && <p>⏱ {t.duration} menit</p>}
                <p>👥 {t._count.enrollments} peserta{t.maxParticipants ? ` / maks ${t.maxParticipants}` : ''}</p>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: '#f0ece0' }}>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {t.isPublished ? '✓ Dipublikasi' : 'Draft'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
