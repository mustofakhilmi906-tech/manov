export function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));
}
export function formatDateShort(d: Date | string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d));
}
export function cn(...c: (string | undefined | false | null)[]) { return c.filter(Boolean).join(' '); }

export const TYPE_LABELS: Record<string, string> = {
  EBOOK: 'E-Book', JOURNAL: 'Jurnal', PAPER: 'Paper', VIDEO: 'Video', THESIS: 'Tesis',
};
export const TYPE_BADGE: Record<string, string> = {
  EBOOK: 'badge-ebook', JOURNAL: 'badge-journal', PAPER: 'badge-paper', VIDEO: 'badge-video', THESIS: 'badge-thesis',
};
export const TRAINING_BADGE: Record<string, string> = {
  WEBINAR: 'badge-webinar', WORKSHOP: 'badge-workshop', MODUL: 'badge-modul', VIDEO: 'badge-video',
};
export const STAGE_LABELS: Record<string, string> = {
  TOPIC_SELECTION: 'Pemilihan Topik', PROPOSAL: 'Proposal', DATA_COLLECTION: 'Pengumpulan Data',
  WRITING: 'Penulisan', REVISION: 'Revisi', PUBLICATION: 'Publikasi',
};
export const ROLE_LABELS: Record<string, string> = {
  MAHASISWA: 'Mahasiswa', PUSTAKAWAN: 'Pustakawan', PAKAR: 'Pakar/Dosen', ADMIN: 'Admin',
};
