import { useState } from 'react'
import { parseNumber } from '../../lib/answer.js'
import { checkSolve } from '../../lib/checkStep.js'
import { formatMeasure } from '../../lib/geometry.js'
import AnswerInput from '../answer/AnswerInput.jsx'
import PrimaryButton from '../ui/PrimaryButton.jsx'
import AnswerFeedback from './AnswerFeedback.jsx'
import StepCard from './StepCard.jsx'
import StepFigure from './StepFigure.jsx'
import StepTools from './StepTools.jsx'

/**
 * Soal hitung (solve; juga soal hitung Tantangan). Diperiksa diagnose() lewat checkSolve.
 * `prelude` = isi sebelum isian (mis. pilihan keliling/luas); `ready` = isian sudah boleh tampil.
 */
export default function SolveStep({ step, record, onAttempt, onHint, isChallenge = false, prelude = null, ready = true }) {
  const [raw, setRaw] = useState('')
  const [unit, setUnit] = useState(null)
  const [result, setResult] = useState(null)
  const done = record?.done === true

  const check = () => {
    const r = checkSolve(step, raw, unit)
    if (!r) return
    setResult(r)
    onAttempt(r)
  }

  return (
    <StepCard title={step.title} text={step.text} figure={step.figure && <StepFigure figure={step.figure} />}>
      {prelude}
      {ready && (
        <>
          {(!done || result) && (
            <AnswerInput
              label={step.answerLabel}
              value={raw}
              onValue={setRaw}
              unit={unit}
              onUnit={setUnit}
              units={step.units}
              disabled={done}
            />
          )}
          <AnswerFeedback
            step={step}
            record={record}
            result={result}
            isChallenge={isChallenge}
            revealText={`${formatMeasure(step.answer.value)} ${step.answer.unit}`}
          />
          <StepTools hints={step.hints} record={record} onHint={onHint} />
          {!done && (
            <PrimaryButton onClick={check} disabled={parseNumber(raw) === null}>
              Cek jawaban
            </PrimaryButton>
          )}
        </>
      )}
    </StepCard>
  )
}
