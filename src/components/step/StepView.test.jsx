// Uji asap: setiap langkah Pertemuan 1 & 2 bisa dirender tanpa galat (react-dom/server).
// Interaksi sentuh dan tampilan 360 × 640 tetap dicek manual di HP.
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import MEETINGS from '../../content/meetings.js'
import { flattenSteps } from '../../lib/stepEngine.js'
import StepView from './StepView.jsx'

const noop = () => {}
const allSteps = (n) =>
  MEETINGS[n].phases.flatMap(({ phase, steps }) =>
    steps.flatMap((s) => (s.items ? s.items.map((item) => ({ ...s, ...item, phase })) : [{ ...s, phase }])),
  )

describe.each([1, 2])('Pertemuan %i', (n) => {
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
