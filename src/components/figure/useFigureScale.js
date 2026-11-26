import { useLayoutEffect, useState } from 'react'

// Ruang tepi (px) untuk label di sekeliling bangun.
const PAD = 40
const FALLBACK_WIDTH = 328 // 360 px − padding kartu

/**
 * Ukur lebar wadah SVG (ResizeObserver) lalu petakan satuan petak → px.
 * Gambar memakai viewBox dalam px nyata, jadi tebal garis & ukuran huruf
 * selalu sesuai DESIGN.md §2.2 berapa pun skala bangunnya.
 *
 * @param {React.RefObject<SVGSVGElement>} ref
 * @param {{minX:number, maxX:number, minY?:number, maxY:number}} bounds  satuan petak (y ke atas)
 */
export default function useFigureScale(ref, bounds) {
  const [width, setWidth] = useState(FALLBACK_WIDTH)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    setWidth(el.getBoundingClientRect().width || FALLBACK_WIDTH)
    const ro = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])

  const height = (width * 3) / 4 // rasio 4:3 (DESIGN.md §3)
  const minY = bounds.minY ?? 0
  const spanX = bounds.maxX - bounds.minX
  const spanY = bounds.maxY - minY
  const unit = Math.min((width - 2 * PAD) / spanX, (height - 2 * PAD) / spanY)
  const left = (width - spanX * unit) / 2 - bounds.minX * unit
  const bottom = height - (height - spanY * unit) / 2 + minY * unit

  /** [x, y] satuan petak → [px, py] di viewBox */
  const toPx = ([x, y]) => [left + x * unit, bottom - y * unit]

  /** posisi jari/kursor → {x, y} satuan petak (pecahan; di-snap oleh geometry.js) */
  const toGrid = (clientX, clientY) => {
    const r = ref.current.getBoundingClientRect()
    const sx = ((clientX - r.left) / r.width) * width
    const sy = ((clientY - r.top) / r.height) * height
    return { x: (sx - left) / unit, y: (bottom - sy) / unit }
  }

  return { width, height, unit, toPx, toGrid }
}
