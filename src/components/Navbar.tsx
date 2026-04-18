'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/repository', label: 'Repositori', icon: '📚' },
  { href: '/repository/eksternal', label: 'Jurnal Internasional', icon: '🌐' },
  { href: '/konsultasi', label: 'Konsultasi', icon: '💬' },
  { href: '/pelatihan', label: 'Pelatihan', icon: '🎓' },
  { href: '/pendampingan', label: 'Pendampingan', icon: '🔬' },
  { href: '/langganan', label: 'Harga', icon: '⭐' },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const role = (session?.user as any)?.role;

  return (
    <header style={{ background: 'white', borderBottom: '1px solid #e8e4d8' }} className="sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm" style={{ background: 'var(--teal)' }}>J</div>
            <span className="font-display font-bold text-xl" style={{ color: 'var(--teal)' }}>JagoIlmiah</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith(l.href) ? 'text-teal-DEFAULT bg-teal-pale' : 'text-ink-muted hover:text-ink hover:bg-parchment'}`}
                style={pathname.startsWith(l.href) ? { color: 'var(--teal)', background: 'var(--teal-pale)' } : { color: 'var(--ink-muted)' }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium transition-colors" style={{ color: 'var(--ink-muted)' }}>Dashboard</Link>
                <div className="relative">
                  <button onClick={() => setDropOpen(!dropOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors"
                    style={{ borderColor: '#d1d5db', color: 'var(--ink)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--teal)' }}>
                      {session.user?.name?.[0]}
                    </div>
                    <span>{session.user?.name?.split(' ')[0]}</span>
                    <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  {dropOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border bg-white shadow-lg overflow-hidden" style={{ borderColor: '#e8e4d8' }}>
                      <div className="p-3 border-b" style={{ borderColor: '#e8e4d8', background: 'var(--parchment)' }}>
                        <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{session.user?.name}</p>
                        <p className="text-xs" style={{ color: 'var(--slate)' }}>{role}</p>
                      </div>
                      <div className="p-1">
                        <Link href="/dashboard" onClick={() => setDropOpen(false)} className="nav-link text-sm">Dashboard</Link>
                        <Link href="/profil" onClick={() => setDropOpen(false)} className="nav-link text-sm">Profil Saya</Link>
                        <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full text-left nav-link text-sm" style={{ color: 'var(--crimson)' }}>Keluar</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium" style={{ color: 'var(--ink-muted)' }}>Masuk</Link>
                <Link href="/register" className="btn-primary text-sm">Daftar Gratis</Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg" style={{ color: 'var(--ink-muted)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t pt-3" style={{ borderColor: '#e8e4d8' }}>
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="nav-link mb-1">{l.icon} {l.label}</Link>
            ))}
            <div className="border-t mt-3 pt-3" style={{ borderColor: '#e8e4d8' }}>
              {session ? (
                <>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="nav-link">Dashboard</Link>
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="nav-link w-full text-left" style={{ color: 'var(--crimson)' }}>Keluar</button>
                </>
              ) : (
                <div className="flex gap-3 px-3">
                  <Link href="/login" className="btn-outline flex-1 justify-center">Masuk</Link>
                  <Link href="/register" className="btn-primary flex-1 justify-center">Daftar</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
