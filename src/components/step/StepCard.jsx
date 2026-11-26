/**
 * Kartu langkah (DESIGN.md §3): judul + (opsional) satu gambar + ≤ 3 kalimat.
 * Teks tepat di bawah gambar agar tidak perlu menggulir bolak-balik.
 */
export default function StepCard({ title, figure, text = [], children }) {
  return (
    <article className="space-y-3 rounded-card border border-surface-border bg-surface p-4">
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
