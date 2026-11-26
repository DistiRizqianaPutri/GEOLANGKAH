import { describe, expect, it } from 'vitest'
import { dragTopVertex, trapezoidFromSides, trapezoidMeasures } from '../../lib/geometry.js'
import { estimateLabelWidth, fitLabelX, labelSpan, legLabelLayout } from './labelFit.js'

// Skala yang sama dengan useFigureScale (lebar 328, rasio 4:3, PAD 40).
function scale(bounds, width = 328) {
  const height = (width * 3) / 4
  const pad = 40
  const unit = Math.min((width - 2 * pad) / (bounds.maxX - bounds.minX), (height - 2 * pad) / bounds.maxY)
  const left = (width - (bounds.maxX - bounds.minX) * unit) / 2
  const bottom = height - (height - bounds.maxY * unit) / 2
  return { width, toPx: ([x, y]) => [left + x * unit, bottom - y * unit] }
}

describe('estimateLabelWidth', () => {
  it('teks lebih panjang → lebih lebar', () => {
    expect(estimateLabelWidth('s ≈ 6,1 cm')).toBeGreaterThan(estimateLabelWidth('s = 5 cm'))
  })
  it('perkiraan tidak lebih sempit dari huruf 15 px tebal (± 9 px per huruf)', () => {
    expect(estimateLabelWidth('s ≈ 6,1 cm')).toBeGreaterThanOrEqual(90)
  })
})

describe('fitLabelX — label tidak pernah keluar dari gambar', () => {
  it.each([
    [37.75, 'end'],
    [-20, 'middle'],
    [320, 'start'],
    [164, 'middle'],
  ])('x = %f, anchor %s', (x, anchor) => {
    const w = estimateLabelWidth('s ≈ 6,1 cm')
    const fx = fitLabelX(x, anchor, w, 328)
    const [l, r] = labelSpan(fx, anchor, w)
    expect(l).toBeGreaterThanOrEqual(0)
    expect(r).toBeLessThanOrEqual(328)
  })

  it('label yang sudah muat tidak digeser', () => {
    expect(fitLabelX(164, 'middle', 80, 328)).toBe(164)
  })
})

describe('legLabelLayout — temuan M3: a=16, b=14, t=6 (bisa digeser)', () => {
  const iso = trapezoidFromSides({ kind: 'isosceles', a: 16, b: 10, t: 4 })
  const dragged = dragTopVertex(iso, 'D', { x: 1, y: 6 })
  const m = trapezoidMeasures(dragged)
  const { width, toPx } = scale({ minX: 0, maxX: 16, maxY: 10 })

  it('kedua label kaki utuh di dalam gambar, berformat "s ≈ 6,1 cm"', () => {
    const { labels, cramped } = legLabelLayout(m, toPx, 'cm', width)
    expect(cramped).toBe(true)
    for (const { x, anchor, text } of labels) {
      expect(text).toBe('s ≈ 6,1 cm')
      const [l, r] = labelSpan(fitLabelX(x, anchor, estimateLabelWidth(text), width), anchor, estimateLabelWidth(text))
      expect(l).toBeGreaterThanOrEqual(0)
      expect(r).toBeLessThanOrEqual(width)
    }
  })

  it('saat sempit, label kaki pindah ke ¼ tinggi (menjauh dari label t di ¾)', () => {
    const { labels } = legLabelLayout(m, toPx, 'cm', width)
    const [, yBase] = toPx([0, 0])
    const [, yTop] = toPx([0, m.t])
    expect(labels[0].y).toBeCloseTo(yBase + (yTop - yBase) * 0.25, 6)
  })

  it('gambar statis 16/10/4 di 360 px: label juga utuh (ternyata ikut terpotong di M3)', () => {
    const mm = trapezoidMeasures(iso)
    const s = scale({ minX: 0, maxX: 16, maxY: 4 })
    const { labels } = legLabelLayout(mm, s.toPx, 'cm', s.width)
    expect(labels.map((l) => l.text)).toEqual(['s = 5 cm', 's = 5 cm'])
    for (const { x, anchor, text } of labels) {
      const w = estimateLabelWidth(text)
      const [l, r] = labelSpan(fitLabelX(x, anchor, w, s.width), anchor, w)
      expect(l).toBeGreaterThanOrEqual(0)
      expect(r).toBeLessThanOrEqual(s.width)
    }
  })

  it('layar lebar: label kaki tetap di tengah kaki, di sisi luar', () => {
    const mm = trapezoidMeasures(iso)
    const s = scale({ minX: 0, maxX: 16, maxY: 4 }, 800)
    const { labels, cramped } = legLabelLayout(mm, s.toPx, 'cm', s.width)
    expect(cramped).toBe(false)
    const [, yBase] = s.toPx([0, 0])
    const [, yTop] = s.toPx([0, 4])
    expect(labels[0].y).toBeCloseTo((yBase + yTop) / 2, 6)
  })
})
