import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { TYPE_LABELS, formatDate } from '@/lib/utils';
import AdminResourceForm from './AdminResourceForm';

export default async function AdminResourcesPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/');

  const resources = await prisma.resource.findMany({ orderBy: { createdAt: 'desc' } });

  const TYPE_COLORS: Record<string, string> = {
    EBOOK: '#eef2ff', JOURNAL: '#f0fdf4', PAPER: '#fff7ed', VIDEO: '#fdf4ff', THESIS: '#f0f9ff',
  };
  const TYPE_TEXT: Record<string, string> = {
    EBOOK: '#3730a3', JOURNAL: '#166534', PAPER: '#9a3412', VIDEO: '#7e22ce', THESIS: '#075985',
  };

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--parchment)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/admin/dashboard" className="text-xs mb-1 block hover:underline" style={{ color: 'var(--teal)' }}>← Dashboard Admin</a>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Kelola Sumber Digital</h1>
          </div>
          <AdminResourceForm />
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#e8e4d8', background: 'var(--parchment-dark)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{resources.length} sumber tersedia</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #e8e4d8', background: 'var(--parchment)' }}>
                  {['Judul', 'Tipe', 'Kategori', 'Tahun', 'Akses', 'Unduhan', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--slate)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resources.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f0ece0', background: i % 2 === 0 ? 'white' : 'var(--parchment)' }}>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium line-clamp-1" style={{ color: 'var(--ink)', fontFamily: 'Lora, serif' }}>{r.title}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--slate)' }}>{r.authors}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold border"
                        style={{ background: TYPE_COLORS[r.type] || '#f3f4f6', color: TYPE_TEXT[r.type] || '#374151', borderColor: 'transparent' }}>
                        {TYPE_LABELS[r.type] || r.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--slate)' }}>{r.category}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--slate)' }}>{r.year || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${r.isOpenAccess ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {r.isOpenAccess ? 'Open' : 'Terbatas'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--slate)' }}>{r.downloadCount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AdminResourceForm resource={r} />
                      </div>
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




