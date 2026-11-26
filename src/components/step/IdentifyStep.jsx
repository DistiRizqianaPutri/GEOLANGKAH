import { useState } from 'react'
import { checkIdentify } from '../../lib/checkStep.js'
import PrimaryButton from '../ui/PrimaryButton.jsx'
import AnswerFeedback from './AnswerFeedback.jsx'
import StepCard from './StepCard.jsx'
import StepFigure from './StepFigure.jsx'
import StepTools from './StepTools.jsx'

const NAME = { a: 'sisi AB', b: 'sisi DC', s1: 'sisi AD', s2: 'sisi BC', t: 'garis putus-putus dari D' }

/**
 * Ketuk unsur pada gambar (identify; juga Tantangan ② soal 1).
 * Satu jawaban: ketukan mengganti pilihan. Dua jawaban: ketuk lagi untuk membatalkan.
 */
export default function IdentifyStep({ step, record, onAttempt, onHint, isChallenge = false }) {
  const [selected, setSelected] = useState([])
  const [result, setResult] = useState(null)
  const done = record?.done === true
  const single = step.answer.length === 1

  const toggle = (key) =>
    setSelected((s) => (single ? [key] : s.includes(key) ? s.filter((k) => k !== key) : [...s, key]))

  const check = () => {
    const r = checkIdentify(step, selected)
    setResult(r)
    onAttempt(r)
  }

  // Setelah selesai (atau kesempatan habis), gambar menandai jawaban yang benar.
  const shown = done && (!result || record.revealed) ? step.answer : selected

  return (
    <StepCard
      title={step.title}
      stage={step.stage}
      text={step.text}
      figure={<StepFigure figure={step.figure} selectable={{ selected: shown, onToggle: toggle, disabled: done }} />}
    >
      <AnswerFeedback
        step={step}
        record={record}
        result={result}
        isChallenge={isChallenge}
        revealText={step.answer.map((k) => NAME[k]).join(' dan ')}
      />
      <StepTools hints={step.hints} record={record} onHint={onHint} />
      {!done && (
        <PrimaryButton onClick={check} disabled={selected.length === 0}>
          Cek jawaban
        </PrimaryButton>
      )}
    </StepCard>
  )
}
