import { useState } from 'react'
import { parseAnswer } from '../../lib/answer.js'
import { checkFaded } from '../../lib/checkStep.js'
import { formatAnswer } from '../../lib/geometry.js'
import AnswerInput from '../answer/AnswerInput.jsx'
import PrimaryButton from '../ui/PrimaryButton.jsx'
import AnswerFeedback from './AnswerFeedback.jsx'
import FadedTemplate from './FadedTemplate.jsx'
import StepCard from './StepCard.jsx'
import StepFigure from './StepFigure.jsx'
import StepTools from './StepTools.jsx'

/** Contoh memudar: isi kotak ▢ di rumus, lalu hasil akhir + satuan. */
export default function FadedStep({ step, record, onAttempt, onHint }) {
  const [blanks, setBlanks] = useState({})
  const [raw, setRaw] = useState('')
  const [unit, setUnit] = useState(null)
  const [result, setResult] = useState(null)
  const done = record?.done === true

  const check = () => {
    const r = checkFaded(step, blanks, raw, unit)
    if (!r) return
    setResult(r)
    onAttempt(r)
  }

  return (
    <StepCard title={step.title} text={step.text} stage={step.stage} figure={step.figure && <StepFigure figure={step.figure} />}>
      {(!done || result) && (
        <>
          <FadedTemplate
            template={step.template}
            blanks={blanks}
            onBlank={(k, v) => setBlanks((b) => ({ ...b, [k]: v }))}
            disabled={done}
          />
          <AnswerInput label={step.answerLabel} value={raw} onValue={setRaw} unit={unit} onUnit={setUnit} units={step.units} disabled={done} />
        </>
      )}
      <AnswerFeedback step={step} record={record} result={result} revealText={formatAnswer(step.answer.value, step.answer.unit)} />
      <StepTools hints={step.hints} record={record} onHint={onHint} />
      {!done && (
        <PrimaryButton onClick={check} disabled={parseAnswer(raw, unit) === null}>
          Cek jawaban
        </PrimaryButton>
      )}
    </StepCard>
  )
}
