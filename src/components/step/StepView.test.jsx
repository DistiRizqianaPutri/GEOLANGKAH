// Uji asap: setiap langkah Pertemuan 1–5 bisa dirender tanpa galat (react-dom/server).
// Interaksi sentuh dan tampilan 360 × 640 tetap dicek manual di HP.
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import MEETINGS from '../../content/meetings.js'
import PHASE_LABEL from '../../content/phases.json'
import { flattenSteps } from '../../lib/stepEngine.js'
import { askedKey } from '../../lib/story.js'
import StepView from './StepView.jsx'

const noop = () => {}
const allSteps = (n) =>
  MEETINGS[n].phases.flatMap(({ phase, steps }) =>
    steps.flatMap((s) => (s.items ? s.items.map((item) => ({ ...s, ...item, phase })) : [{ ...s, phase }])),
  )

describe.each([1, 2, 3, 4, 5])('Pertemuan %i', (n) => {
  it.each(allSteps(n).map((s) => [s.id, s]))('%s: render tanpa galat (belum & sudah dijawab)', (_, step) => {
    const html = renderToString(<StepView step={step} records={{}} onAttempt={noop} onHint={noop} />)
    expect(html).toContain(step.title)
    const done = { [step.id]: { attempts: 2, is_correct: false, done: true, revealed: true, max_hint_level: 1, answer: 'x' } }
    expect(() => renderToString(<StepView step={step} records={done} onAttempt={noop} onHint={noop} />)).not.toThrow()
  })

  it('tidak ada emoji di layar belajar yang dirender', () => {
    for (const step of flattenSteps(MEETINGS[n], `T01-m${n}`)) {
      const html = renderToString(<StepView step={step} records={{}} onAttempt={noop} onHint={noop} />)
      expect(html, step.id).not.toMatch(/\p{Extended_Pictographic}/u)
    }
  })
})

describe('Tanya Tutor (M8)', () => {
  const solve = allSteps(3).find((s) => s.id === 'm3-latih-02')
  const html = (rec) => renderToString(<StepView step={solve} records={{ [solve.id]: rec }} onAttempt={noop} onHint={noop} />)
  it('belum tampil sebelum petunjuk L2 dibuka', () => {
    expect(html({ attempts: 0, max_hint_level: 1 })).not.toContain('Tanya Tutor')
  })
  it('tampil setelah L2, hilang setelah soal selesai', () => {
    expect(html({ attempts: 0, max_hint_level: 2 })).toContain('Tanya Tutor')
    expect(html({ attempts: 1, max_hint_level: 2, done: true, is_correct: true })).not.toContain('Tanya Tutor')
  })
})

describe('label fase RMT', () => {
  it('setiap fase punya label "Fase n · …"', () => {
    for (const n of [1, 2, 3, 4, 5]) for (const { phase } of MEETINGS[n].phases) expect(PHASE_LABEL[phase]).toMatch(/^Fase [123] · /)
  })
})

describe('StoryStep (soal cerita P5)', () => {
  const story = allSteps(5).find((s) => s.id === 'm5-bangun-01')
  const render = (records) => renderToString(<StepView step={story} records={records} onAttempt={noop} onHint={noop} />)

  it('awal: bagian 1, chip bisa diketuk, tombol Pindahkan, tabel kosong, Ditanya belum tampil', () => {
    const html = render({})
    expect(html).toContain('Tahap: Rumuskan')
    expect(html).toMatch(/Bagian (<!-- -->)?1(<!-- -->)? dari (<!-- -->)?5/)
    expect(html).toContain('Tandai Pak Darto')
    expect(html).toContain('Pindahkan ke Diketahui')
    expect(html).toContain('Belum ada')
    expect(html).not.toContain('Pagar: keliling atau luas?')
  })

  it('selesai: Diketahui & Ditanya lengkap, terkunci (tanpa tombol hapus/pindah)', () => {
    const records = {
      [story.id]: { attempts: 1, is_correct: true, done: true },
      [askedKey(story, 0)]: { attempts: 1, is_correct: true, done: true },
      [askedKey(story, 1)]: { attempts: 1, is_correct: true, done: true },
    }
    const html = render(records)
    for (const text of ['a = 20 m', 'b = 12 m', 'sisi tegak = 15 m', 'sisi miring = 17 m', 'pupuk: 1 kg tiap 10 m²', 'Pagar: keliling', 'Pupuk: luas'])
      expect(html).toContain(text)
    expect(html).not.toContain('Pindahkan ke Diketahui')
    expect(html).not.toContain('Hapus ')
  })
})
