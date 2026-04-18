import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'JagoIlmiah — Platform Akademik Digital Mahasiswa',
  description: 'Repositori e-book & jurnal, layanan referensi virtual, pelatihan literasi digital, dan pendampingan riset untuk mahasiswa Indonesia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Source+Sans+3:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen" style={{ background: 'var(--parchment)' }}>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <footer className="border-t mt-20 py-10 px-6" style={{ borderColor: '#e8e4d8', background: 'var(--parchment-dark)' }}>
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold" style={{ color: 'var(--teal)' }}>JagoIlmiah</span>
                <span className="text-sm" style={{ color: 'var(--slate)' }}>— Platform Akademik Digital Mahasiswa Indonesia</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--slate)' }}>© {new Date().getFullYear()} JagoIlmiah. Seluruh hak cipta dilindungi.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
