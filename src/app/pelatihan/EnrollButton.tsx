'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EnrollButton({ trainingId, isEnrolled, isLoggedIn, isFull }: {
  trainingId: string; isEnrolled: boolean; isLoggedIn: boolean; isFull: boolean;
}) {
  const router = useRouter();
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const [loading, setLoading] = useState(false);

  const enroll = async () => {
    if (!isLoggedIn) { router.push('/login'); return; }
    setLoading(true);
    await fetch('/api/trainings/enroll', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainingId }),
    });
    setEnrolled(true); setLoading(false); router.refresh();
  };

  if (enrolled) return (
    <div className="w-full py-2.5 rounded-xl text-center text-sm font-semibold" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
      ✓ Sudah Terdaftar
    </div>
  );
  if (isFull) return (
    <div className="w-full py-2.5 rounded-xl text-center text-sm font-medium" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
      🔒 Kapasitas Penuh
    </div>
  );
  return (
    <button onClick={enroll} disabled={loading} className="btn-primary w-full justify-center py-2.5 disabled:opacity-60">
      {loading ? 'Mendaftarkan...' : '🎓 Daftar Sekarang — Gratis'}
    </button>
  );
}
