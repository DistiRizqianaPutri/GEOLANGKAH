import { describe, expect, it } from 'vitest'
import { distanceToSegment, nearestSegment } from './hitTest.js'

describe('nearestSegment (ketuk unsur)', () => {
  const segments = [
    { key: 's1', from: [0, 100], to: [30, 0] }, // kaki miring
    { key: 't', from: [30, 0], to: [30, 100] }, // garis tinggi
    { key: 'a', from: [0, 100], to: [200, 100] },
  ]
  it('jarak ke ruas, termasuk ujungnya', () => {
    expect(distanceToSegment([30, 50], [30, 0], [30, 100])).toBe(0)
    expect(distanceToSegment([30, 130], [30, 0], [30, 100])).toBe(30)
  })
  it('memilih segmen terdekat walau target sentuhnya bertumpuk', () => {
    expect(nearestSegment([34, 50], segments)).toBe('t')
    expect(nearestSegment([12, 50], segments)).toBe('s1')
    expect(nearestSegment([120, 96], segments)).toBe('a')
  })
  it('terlalu jauh → null', () => {
    expect(nearestSegment([120, 40], segments)).toBeNull()
  })
})
