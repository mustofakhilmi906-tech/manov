import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatDate, ROLE_LABELS } from '@/lib/utils';

const PLAN_BADGE: Record<string, string> = {
  FREE:      'bg-gray-100 text-gray-600 border-gray-200',
  PELAJAR:   'bg-teal-50 text-teal-700 border-teal-200',
  PENELITI:  'bg-amber-50 text-amber-700 border-amber-200',
  SKRIPSI:   'bg-rose-50 text-rose-700 border-rose-200',
};
const ROLE_BADGE: Record<string, string> = {
  MAHASISWA: 'bg-blue-50 text-blue-700 border-blue-200',
  PUSTAKAWAN:'bg-teal-50 text-teal-700 border-teal-200',
  PAKAR:     'bg-amber-50 text-amber-700 border-amber-200',
  ADMIN:     'bg-red-50 text-red-700 border-red-200',
};

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/');

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      subscription: { select: { plan: true, status: true, endDate: true } },
      _count: { select: { consultations: true, researchSessions: true, enrollments: true } },
    },
  });

  const byRole = {
    MAHASISWA:  users.filter(u => u.role === 'MAHASISWA').length,
    PUSTAKAWAN: users.filter(u => u.role === 'PUSTAKAWAN').length,
    PAKAR:      users.filter(u => u.role === 'PAKAR').length,
    ADMIN:      users.filter(u => u.role === 'ADMIN').length,
  };
  const paid = users.filter(u => u.subscription && u.subscription.plan !== 'FREE').length;

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--parchment)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <a href="/admin/dashboard" className="text-xs mb-1 block hover:underline" style={{ color: 'var(--teal)' }}>← Dashboard Admin</a>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Kelola Pengguna</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: users.length, color: 'var(--ink)' },
            { label: 'Mahasiswa', value: byRole.MAHASISWA, color: '#1d4ed8' },
            { label: 'Pustakawan', value: byRole.PUSTAKAWAN, color: 'var(--teal)' },
            { label: 'Pakar', value: byRole.PAKAR, color: 'var(--amber)' },
            { label: 'Berlangganan', value: paid, color: '#be123c' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--slate)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #e8e4d8', background: 'var(--parchment-dark)' }}>
                  {['Pengguna', 'Role', 'Institusi', 'Langganan', 'Aktivitas', 'Bergabung'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--slate)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f0ece0', background: i % 2 === 0 ? 'white' : 'var(--parchment)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ background: 'var(--teal)' }}>{u.name[0]}</div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--ink)' }}>{u.name}</p>
                          <p className="text-xs" style={{ color: 'var(--slate)' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_BADGE[u.role]}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--slate)' }}>
                      {u.prodi && <p>{u.prodi}</p>}
                      {u.institusi && <p>{u.institusi}</p>}
                      {!u.prodi && !u.institusi && '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PLAN_BADGE[u.subscription?.plan || 'FREE']}`}>
                        {u.subscription?.plan || 'FREE'}
                      </span>
                      {u.subscription?.endDate && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--slate)' }}>
                          s/d {formatDate(u.subscription.endDate)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--slate)' }}>
                      <div className="space-y-0.5">
                        <p>💬 {u._count.consultations} konsultasi</p>
                        <p>🔬 {u._count.researchSessions} sesi riset</p>
                        <p>🎓 {u._count.enrollments} pelatihan</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--slate)' }}>
                      {formatDate(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
