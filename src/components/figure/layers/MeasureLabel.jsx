import { useContext } from 'react'
import FigureViewContext from '../FigureViewContext.js'
import { estimateLabelWidth, fitLabelX } from '../labelFit.js'

/**
 * Label ukuran yang menempel di gambar (DESIGN.md §2.2; angka 15 px tebal).
 * Diberi "halo" warna kartu supaya terbaca di atas petak dan garis.
 * Posisi x digeser seperlunya agar label tidak terpotong di tepi gambar.
 */
export default function MeasureLabel({ x, y, text, anchor = 'middle', className = 'fill-text' }) {
  const { width } = useContext(FigureViewContext)
  const fx = fitLabelX(x, anchor, estimateLabelWidth(text), width)
  return (
    <text
      x={fx}
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
