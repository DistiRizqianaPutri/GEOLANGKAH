/**
 * Label ukuran yang menempel di gambar (DESIGN.md §2.2; angka 15 px tebal).
 * Diberi "halo" warna kartu supaya terbaca di atas petak dan garis.
 */
export default function MeasureLabel({ x, y, text, anchor = 'middle', className = 'fill-text' }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="middle"
      className={`${className} stroke-surface text-figure font-extrabold`}
      strokeWidth={4}
      paintOrder="stroke"
      strokeLinejoin="round"
    >
      {text}
    </text>
  )
}
