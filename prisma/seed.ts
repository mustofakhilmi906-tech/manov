import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding JagoIlmiah...');

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jagoilmiah.id' }, update: {},
    create: { name: 'Admin JagoIlmiah', email: 'admin@jagoilmiah.id', password: await hash('admin123'), role: 'ADMIN', institusi: 'JagoIlmiah' },
  });

  const pustakawan1 = await prisma.user.upsert({
    where: { email: 'ibu.ratna@jagoilmiah.id' }, update: {},
    create: { name: 'Ibu Ratna Kusuma, S.Pust.', email: 'ibu.ratna@jagoilmiah.id', password: await hash('pakar123'), role: 'PUSTAKAWAN', bio: 'Pustakawan senior dengan 12 tahun pengalaman. Spesialis penelusuran database Scopus, Web of Science, dan manajemen referensi.', institusi: 'Universitas Indonesia', prodi: 'Perpustakaan & Informasi' },
  });

  const pustakawan2 = await prisma.user.upsert({
    where: { email: 'pak.hendra@jagoilmiah.id' }, update: {},
    create: { name: 'Pak Hendra Wijaya, M.Pust.', email: 'pak.hendra@jagoilmiah.id', password: await hash('pakar123'), role: 'PUSTAKAWAN', bio: 'Pustakawan riset embedded. Berpengalaman mendampingi 200+ mahasiswa S1-S3 dari perumusan topik hingga publikasi jurnal internasional.', institusi: 'ITB', prodi: 'Library & Information Science' },
  });

  const pakar1 = await prisma.user.upsert({
    where: { email: 'prof.anisa@jagoilmiah.id' }, update: {},
    create: { name: 'Prof. Dr. Anisa Rahayu', email: 'prof.anisa@jagoilmiah.id', password: await hash('pakar123'), role: 'PAKAR', bio: 'Guru Besar Metodologi Penelitian UGM. Penulis 80+ artikel di jurnal Q1 Scopus. Expert academic writing & systematic review.', institusi: 'UGM', prodi: 'Metodologi Penelitian' },
  });

  const pakar2 = await prisma.user.upsert({
    where: { email: 'dr.farid@jagoilmiah.id' }, update: {},
    create: { name: 'Dr. Farid Maulana, M.T.', email: 'dr.farid@jagoilmiah.id', password: await hash('pakar123'), role: 'PAKAR', bio: 'Dosen Teknik Informatika UNPAD. Spesialis data science research, penulisan karya ilmiah bidang teknologi, dan sitasi IEEE.', institusi: 'UNPAD', prodi: 'Teknik Informatika' },
  });

  const mhs1 = await prisma.user.upsert({
    where: { email: 'siti@jagoilmiah.id' }, update: {},
    create: { name: 'Siti Nurhaliza', email: 'siti@jagoilmiah.id', password: await hash('mhs123'), role: 'MAHASISWA', prodi: 'Kedokteran', institusi: 'Universitas Indonesia' },
  });

  const mhs2 = await prisma.user.upsert({
    where: { email: 'budi@jagoilmiah.id' }, update: {},
    create: { name: 'Budi Prasetyo', email: 'budi@jagoilmiah.id', password: await hash('mhs123'), role: 'MAHASISWA', prodi: 'Teknik Informatika', institusi: 'ITB' },
  });

  // Resources
  const resources = [
    { id: 'res-01', title: 'Metodologi Penelitian Kuantitatif dan Kualitatif', authors: 'Sugiyono', abstract: 'Buku teks metodologi penelitian komprehensif yang membahas pendekatan kuantitatif, kualitatif, dan mixed-method. Dilengkapi contoh instrumen penelitian dan analisis data.', type: 'EBOOK', category: 'Metodologi', subject: 'Penelitian', publisher: 'Alfabeta', year: 2023, isOpenAccess: true, isPremium: false, downloadCount: 1842, viewCount: 5620, tags: 'metodologi,penelitian,kuantitatif,kualitatif', language: 'Indonesia' },
    { id: 'res-02', title: 'Systematic Review and Meta-Analysis: A Practical Guide', authors: 'Higgins, J.P.T., Thomas, J., Chandler, J.', abstract: 'Panduan lengkap melakukan systematic review dan meta-analysis untuk penelitian ilmiah. Mencakup protokol PRISMA, strategi pencarian, dan sintesis data.', type: 'JOURNAL', category: 'Metodologi', subject: 'Evidence-Based Research', publisher: 'Cochrane Handbook', year: 2023, doi: '10.1002/9781119536604', isOpenAccess: true, isPremium: false, downloadCount: 924, viewCount: 3100, tags: 'systematic review,meta-analysis,PRISMA', language: 'Inggris' },
    { id: 'res-03', title: 'Kecerdasan Buatan dan Masa Depan Pendidikan di Indonesia', authors: 'Eko Prasetyo, Dewi Lestari', abstract: 'Kajian mendalam tentang implementasi AI dalam sistem pendidikan tinggi Indonesia. Analisis peluang, tantangan, dan rekomendasi kebijakan berdasarkan survei 500 institusi.', type: 'JOURNAL', category: 'Teknologi', subject: 'Pendidikan & AI', publisher: 'Jurnal Pendidikan Indonesia', year: 2024, isOpenAccess: true, isPremium: false, downloadCount: 678, viewCount: 2340, tags: 'AI,pendidikan,teknologi,Indonesia', language: 'Indonesia' },
    { id: 'res-04', title: 'Penulisan Karya Ilmiah yang Efektif', authors: 'Dr. Haryono, M.Pd.', abstract: 'Panduan praktis menyusun karya ilmiah mulai dari struktur penulisan, gaya bahasa akademik, pengelolaan referensi, hingga strategi publikasi di jurnal bereputasi nasional dan internasional.', type: 'EBOOK', category: 'Penulisan Ilmiah', subject: 'Academic Writing', publisher: 'Gramedia Pustaka', year: 2022, isOpenAccess: false, isPremium: true, downloadCount: 2100, viewCount: 7800, tags: 'penulisan ilmiah,karya ilmiah,jurnal,publikasi', language: 'Indonesia' },
    { id: 'res-05', title: 'Climate Change and Biodiversity Loss in Southeast Asian Rainforests', authors: 'Rahman, A., Tan, S.L., Wijaya, D.', abstract: 'Comprehensive study on the impact of climate change on biodiversity across Southeast Asian tropical rainforests. Data collected over 10 years from 50 research sites.', type: 'PAPER', category: 'Lingkungan', subject: 'Biodiversity & Climate', publisher: 'Nature Climate Change', year: 2024, doi: '10.1038/s41558-024-01234-5', isOpenAccess: true, isPremium: false, downloadCount: 445, viewCount: 1670, tags: 'climate change,biodiversity,rainforest,Southeast Asia', language: 'Inggris' },
    { id: 'res-06', title: 'Panduan Lengkap Mendeley untuk Mahasiswa', authors: 'Tim JagoIlmiah', abstract: 'Tutorial langkah demi langkah menggunakan Mendeley Desktop dan Web untuk manajemen referensi, sitasi otomatis, dan kolaborasi penelitian. Termasuk integrasi dengan Microsoft Word.', type: 'VIDEO', category: 'Literasi Digital', subject: 'Manajemen Referensi', publisher: 'JagoIlmiah', year: 2024, isOpenAccess: true, isPremium: false, downloadCount: 3200, viewCount: 12500, tags: 'Mendeley,referensi,sitasi,tutorial', language: 'Indonesia' },
    { id: 'res-07', title: 'Hukum Tata Negara Indonesia Kontemporer', authors: 'Prof. Dr. Sri Soemantri', abstract: 'Kajian komprehensif sistem hukum tata negara Indonesia pasca reformasi. Meliputi konstitusi, lembaga negara, hak asasi manusia, dan dinamika demokrasi kontemporer.', type: 'EBOOK', category: 'Hukum', subject: 'Hukum Tata Negara', publisher: 'PT Raja Grafindo', year: 2023, isOpenAccess: false, isPremium: true, downloadCount: 890, viewCount: 3200, tags: 'hukum,tata negara,konstitusi,Indonesia', language: 'Indonesia' },
    { id: 'res-08', title: 'Data Analysis with Python for Social Scientists', authors: 'Montgomery, D., Peck, E.', abstract: 'Practical guide to quantitative data analysis using Python for social science research. Covers pandas, statistical testing, visualization, and machine learning basics.', type: 'EBOOK', category: 'Teknologi', subject: 'Data Science', publisher: 'O\'Reilly Media', year: 2023, isOpenAccess: false, isPremium: true, downloadCount: 1560, viewCount: 5900, tags: 'python,data analysis,statistics,social science', language: 'Inggris' },
    { id: 'res-09', title: 'Etika Penelitian dan Integritas Akademik', authors: 'Komite Etik Penelitian Nasional', abstract: 'Pedoman etika penelitian ilmiah di Indonesia: prinsip integritas akademik, pencegahan plagiarisme, pengelolaan data, dan etika publikasi ilmiah.', type: 'PAPER', category: 'Metodologi', subject: 'Etika Akademik', publisher: 'Kemendikbudristek', year: 2023, isOpenAccess: true, isPremium: false, downloadCount: 2780, viewCount: 8900, tags: 'etika penelitian,plagiarisme,integritas akademik', language: 'Indonesia' },
    { id: 'res-10', title: 'Zotero: Open-Source Reference Management Tutorial', authors: 'Roy Rosenzweig Center', abstract: 'Complete tutorial on using Zotero for academic research management. Covers installation, browser integration, group libraries, citation styles, and collaboration features.', type: 'VIDEO', category: 'Literasi Digital', subject: 'Manajemen Referensi', publisher: 'Zotero Foundation', year: 2024, isOpenAccess: true, isPremium: false, downloadCount: 1890, viewCount: 7200, tags: 'Zotero,referensi,open source,citation', language: 'Inggris' },
    { id: 'res-11', title: 'Ekonomi Pembangunan Indonesia: Tantangan Abad 21', authors: 'Dr. Boediono, Dr. Sri Mulyani', abstract: 'Analisis mendalam dinamika ekonomi pembangunan Indonesia menghadapi era digitalisasi dan ketidakpastian global. Rekomendasi kebijakan berbasis bukti empiris.', type: 'JOURNAL', category: 'Ekonomi', subject: 'Pembangunan Ekonomi', publisher: 'Buletin Ekonomi Moneter dan Perbankan', year: 2024, isOpenAccess: true, isPremium: false, downloadCount: 730, viewCount: 2600, tags: 'ekonomi,pembangunan,Indonesia,kebijakan', language: 'Indonesia' },
    { id: 'res-12', title: 'Neuroscience of Learning and Memory', authors: 'Kandel, E.R., Koester, J.', abstract: 'Comprehensive textbook on the neurological basis of learning and memory. Covers synaptic plasticity, long-term potentiation, and implications for educational neuroscience.', type: 'EBOOK', category: 'Kedokteran', subject: 'Neurosains', publisher: 'McGraw-Hill', year: 2022, doi: '10.1036/9781265312373', isOpenAccess: false, isPremium: true, downloadCount: 560, viewCount: 1900, tags: 'neuroscience,learning,memory,brain', language: 'Inggris' },
  ];

  for (const r of resources) {
    await prisma.resource.upsert({ where: { id: r.id }, update: {}, create: r as any });
  }

  // Trainings
  const trainings = [
    { id: 'tr-01', title: 'Penelusuran Database Scopus & Web of Science', description: 'Kuasai teknik pencarian advanced di Scopus dan Web of Science. Belajar Boolean operators, filter by quartile, analisis sitasi, dan ekspor hasil pencarian.', type: 'WEBINAR', topic: 'Penelusuran Database', instructor: 'Ibu Ratna Kusuma, S.Pust.', duration: 120, maxParticipants: 100, isPublished: true },
    { id: 'tr-02', title: 'Manajemen Referensi dengan Mendeley', description: 'Workshop hands-on penggunaan Mendeley dari instalasi, import referensi, manajemen folder, hingga sitasi otomatis di Microsoft Word dan Google Docs.', type: 'WORKSHOP', topic: 'Mendeley', instructor: 'Pak Hendra Wijaya, M.Pust.', duration: 180, maxParticipants: 50, isPublished: true },
    { id: 'tr-03', title: 'Menulis Abstract Jurnal Internasional', description: 'Pelajari struktur IMRAD, kaidah penulisan abstract berbahasa Inggris untuk submission ke jurnal Q1-Q2 Scopus. Disertai review dan feedback langsung.', type: 'WORKSHOP', topic: 'Academic Writing', instructor: 'Prof. Dr. Anisa Rahayu', duration: 150, maxParticipants: 30, isPublished: true },
    { id: 'tr-04', title: 'Open Access: Menemukan Jurnal Gratis Berkualitas', description: 'Panduan lengkap menemukan artikel ilmiah berkualitas secara gratis: DOAJ, PubMed Central, arXiv, GARUDA, dan cara membedakan jurnal predator.', type: 'MODUL', topic: 'Open Access', instructor: 'Ibu Ratna Kusuma, S.Pust.', duration: 60, isPublished: true },
    { id: 'tr-05', title: 'Zotero untuk Penelitian Kolaboratif', description: 'Manfaatkan Zotero Group Libraries untuk riset tim. Sinkronisasi referensi, shared annotations, dan integrasi dengan berbagai platform penulisan.', type: 'WEBINAR', topic: 'Zotero', instructor: 'Dr. Farid Maulana, M.T.', duration: 90, maxParticipants: 80, isPublished: true },
    { id: 'tr-06', title: 'Systematic Review: Dari Protokol hingga PRISMA', description: 'Panduan praktis melakukan systematic review: mendefinisikan PICO, membuat protokol, penelusuran komprehensif, screening, ekstraksi data, dan pelaporan PRISMA.', type: 'WORKSHOP', topic: 'Systematic Review', instructor: 'Prof. Dr. Anisa Rahayu', duration: 240, maxParticipants: 25, isPublished: true },
  ];

  for (const t of trainings) {
    await prisma.training.upsert({ where: { id: t.id }, update: {}, create: t as any });
  }

  // Enroll mhs1 in some trainings
  await prisma.trainingEnroll.upsert({
    where: { userId_trainingId: { userId: mhs1.id, trainingId: 'tr-01' } }, update: {},
    create: { userId: mhs1.id, trainingId: 'tr-01', status: 'COMPLETED', completedAt: new Date() },
  });
  await prisma.trainingEnroll.upsert({
    where: { userId_trainingId: { userId: mhs1.id, trainingId: 'tr-02' } }, update: {},
    create: { userId: mhs1.id, trainingId: 'tr-02', status: 'ENROLLED' },
  });

  // Saved resources for mhs1
  for (const rid of ['res-01', 'res-02', 'res-09']) {
    await prisma.savedResource.upsert({
      where: { userId_resourceId: { userId: mhs1.id, resourceId: rid } }, update: {},
      create: { userId: mhs1.id, resourceId: rid },
    });
  }

  // Citations for mhs1
  await prisma.citation.createMany({
    skipDuplicates: true,
    data: [
      { userId: mhs1.id, resourceId: 'res-01', title: 'Metodologi Penelitian Kuantitatif dan Kualitatif', authors: 'Sugiyono', year: 2023, publisher: 'Alfabeta', style: 'APA', formatted: 'Sugiyono. (2023). Metodologi Penelitian Kuantitatif dan Kualitatif. Alfabeta.', projectName: 'Skripsi - Analisis Persepsi Pasien' },
      { userId: mhs1.id, resourceId: 'res-02', title: 'Systematic Review and Meta-Analysis: A Practical Guide', authors: 'Higgins, J.P.T., Thomas, J.', year: 2023, doi: '10.1002/9781119536604', style: 'APA', formatted: 'Higgins, J. P. T., & Thomas, J. (2023). Systematic Review and Meta-Analysis: A Practical Guide. Cochrane Handbook. https://doi.org/10.1002/9781119536604', projectName: 'Skripsi - Analisis Persepsi Pasien' },
    ],
  });

  // Consultation
  const consult1 = await prisma.consultation.upsert({
    where: { id: 'consult-01' }, update: {},
    create: { id: 'consult-01', mahasiswaId: mhs1.id, pakarId: pustakawan1.id, topic: 'Strategi penelusuran jurnal kedokteran untuk systematic review', description: 'Saya sedang menyusun systematic review tentang efektivitas vaksin COVID-19 pada lansia. Butuh bantuan strategi pencarian di PubMed dan Scopus.', channel: 'CHAT', status: 'IN_PROGRESS' },
  });

  await prisma.consultMessage.createMany({
    skipDuplicates: true,
    data: [
      { consultationId: consult1.id, senderId: mhs1.id, content: 'Halo Ibu Ratna, saya Siti dari FK UI. Saya sedang menyusun systematic review tentang efektivitas vaksin COVID-19 pada lansia usia 60+. Bisa dibantu strategi pencariannya?', isRead: true },
      { consultationId: consult1.id, senderId: pustakawan1.id, content: 'Halo Siti! Tentu saya bantu. Untuk topik ini, kita perlu susun search string yang tepat. Pertama, identifikasi dulu kata kunci utama: (1) COVID-19 vaccine, (2) elderly/older adults/aged, (3) effectiveness/efficacy. Di PubMed gunakan MeSH terms ya.', isRead: true },
      { consultationId: consult1.id, senderId: mhs1.id, content: 'MeSH terms itu apa ya Bu? Saya belum pernah menggunakannya.', isRead: true },
      { consultationId: consult1.id, senderId: pustakawan1.id, content: 'MeSH (Medical Subject Headings) adalah kosakata terstandar PubMed untuk indexing artikel. Contohnya, gunakan "COVID-19 Vaccines"[MeSH] AND "Aged"[MeSH] AND "Vaccine Efficacy"[MeSH]. Saya akan share tutorial lengkapnya ya.', isRead: false },
    ],
  });

  // Research session
  await prisma.researchSession.upsert({
    where: { id: 'rs-01' }, update: {},
    create: {
      id: 'rs-01',
      mahasiswaId: mhs1.id,
      mentorId: pakar1.id,
      title: 'Analisis Persepsi Pasien terhadap Layanan Telemedicine di Indonesia',
      description: 'Penelitian mixed-method untuk skripsi S1 Kedokteran. Fokus pada kepuasan dan hambatan penggunaan telemedicine pasca pandemi.',
      stage: 'WRITING',
      status: 'ACTIVE',
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      milestones: {
        create: [
          { title: 'Finalisasi topik & judul penelitian', isDone: true, doneAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          { title: 'Penyusunan proposal & BAB I', isDone: true, doneAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
          { title: 'Persetujuan etik penelitian', isDone: true, doneAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
          { title: 'Pengumpulan & analisis data', isDone: true, doneAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { title: 'Penulisan BAB IV & V', isDone: false, dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
          { title: 'Revisi dan finalisasi naskah', isDone: false, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
          { title: 'Submission ke jurnal nasional', isDone: false, dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
        ],
      },
    },
  });

  console.log('✅ JagoIlmiah seeded!');
  console.log('\n📧 Demo accounts:');
  console.log('  Mahasiswa : siti@jagoilmiah.id / mhs123');
  console.log('  Mahasiswa : budi@jagoilmiah.id / mhs123');
  console.log('  Pustakawan: ibu.ratna@jagoilmiah.id / pakar123');
  console.log('  Pakar     : prof.anisa@jagoilmiah.id / pakar123');
  console.log('  Admin     : admin@jagoilmiah.id / admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());

// ── Extra seed for new features ──────────────────────────────────────────────
async function seedNewFeatures() {
  const prisma2 = new (require('@prisma/client').PrismaClient)();

  // Seed subscriptions for demo users
  const siti = await prisma2.user.findUnique({ where: { email: 'siti@jagoilmiah.id' } });
  const budi = await prisma2.user.findUnique({ where: { email: 'budi@jagoilmiah.id' } });

  if (siti) {
    await prisma2.subscription.upsert({
      where: { userId: siti.id }, update: {},
      create: { userId: siti.id, plan: 'PENELITI', status: 'ACTIVE', amount: 59000, endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });
  }
  if (budi) {
    await prisma2.subscription.upsert({
      where: { userId: budi.id }, update: {},
      create: { userId: budi.id, plan: 'PELAJAR', status: 'ACTIVE', amount: 29000, endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });
  }

  await prisma2.$disconnect();
}
