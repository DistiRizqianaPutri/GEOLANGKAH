/** Tahap literasi soal cerita (KONTEN §6). */
const STAGE = { rumuskan: 'Rumuskan', hitung: 'Hitung', tafsirkan: 'Tafsirkan' }

/**
 * Kartu langkah (DESIGN.md §3): judul + (opsional) satu gambar + ≤ 3 kalimat.
 * Teks tepat di bawah gambar agar tidak perlu menggulir bolak-balik.
 * `stage` (soal cerita P5) tampil sebagai label kecil di atas judul.
 */
export default function StepCard({ title, figure, text = [], stage, children }) {
  return (
    <article className="space-y-3 rounded-card border border-surface-border bg-surface p-4">
      {STAGE[stage] && <p className="text-body font-extrabold text-text-muted">{`Tahap: ${STAGE[stage]}`}</p>}
      <h1 className="text-step-title font-extrabold text-heading">{title}</h1>
      {figure}
      {text.length > 0 && (
        <div className="space-y-1">
          {text.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>
      )}
      {children}
    </article>
  )
}
