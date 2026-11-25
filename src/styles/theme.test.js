import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Memastikan token DESIGN.md §2 tetap ada di blok @theme.
const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8')
const theme = css.match(/@theme\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''

const colors = {
  'bg-from': '#FFF8E7',
  'bg-to': '#FFE9B8',
  surface: '#FFFDF7',
  'surface-border': '#FCE7A8',
  text: '#1E293B',
  'text-muted': '#57534E',
  heading: '#1E3A5F',
  'primary-from': '#FDE047',
  'primary-to': '#FCD34D',
  'primary-text': '#1E3A5F',
  'primary-shadow': '#E6B84A',
  success: '#15803D',
  error: '#B91C1C',
  hint: '#B45309',
  'hint-bg': '#FFFBEB',
  grid: '#E2E8F0',
  parallel: '#2563EB',
  height: '#EA580C',
  leg: '#64748B',
  area: '#22C55E',
  perimeter: '#7C3AED',
  inactive: '#CBD5E1',
}

describe('token desain di @theme', () => {
  it('blok @theme ada', () => {
    expect(theme).not.toBe('')
  })

  it.each(Object.entries(colors))('--color-%s = %s', (name, hex) => {
    expect(theme).toMatch(new RegExp(`--color-${name}:\\s*${hex};`, 'i'))
  })

  it('tipografi sesuai §2.3', () => {
    expect(theme).toMatch(/--font-sans:\s*"Nunito", system-ui, Roboto, sans-serif;/)
    expect(theme).toMatch(/--text-body:\s*17px;/)
    expect(theme).toMatch(/--text-body--line-height:\s*1\.5;/)
    expect(theme).toMatch(/--text-step-title:\s*20px;/)
    expect(theme).toMatch(/--text-figure:\s*15px;/)
  })

  it('sudut sesuai §2.4', () => {
    expect(theme).toMatch(/--radius-card:\s*16px;/)
    expect(theme).toMatch(/--radius-button:\s*12px;/)
  })
})
