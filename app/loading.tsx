export default function Loading() {
  return (
    <main className="loading-screen" aria-label="Memuat aplikasi">
      <div className="loading-card">
        <div className="loading-mark" aria-hidden="true" />
        <strong>Laporan Harian</strong>
        <span>Menyiapkan dashboard keuangan & inventory…</span>
      </div>
    </main>
  );
}
