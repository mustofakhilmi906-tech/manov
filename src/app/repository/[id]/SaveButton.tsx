'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SaveButton({ resourceId, isSaved, isLoggedIn }: { resourceId: string; isSaved: boolean; isLoggedIn: boolean }) {
  const router = useRouter();
  const [saved, setSaved] = useState(isSaved);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!isLoggedIn) { router.push('/login'); return; }
    setLoading(true);
    await fetch('/api/resources/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resourceId }) });
    setSaved(!saved);
    setLoading(false);
    router.refresh();
  };

  return (
    <button onClick={toggle} disabled={loading} className="btn-outline w-full justify-center"
      style={saved ? { background: 'var(--teal-pale)', color: 'var(--teal)', borderColor: 'var(--teal)' } : {}}>
      {saved ? '📌 Tersimpan' : '🔖 Simpan Referensi'}
    </button>
  );
}
