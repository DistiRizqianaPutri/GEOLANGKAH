import { useState } from 'react'
import ChoiceQuestion from './ChoiceQuestion.jsx'
import StepCard from './StepCard.jsx'
import StepFigure from './StepFigure.jsx'

/**
 * Langkah jelajah: gambar bisa digeser, atau jenisnya diganti ("Ubah jenis"),
 * lalu (opsional) satu pertanyaan pilihan ganda.
 */
export default function ExploreStep({ step, record, onAttempt }) {
  const [variant, setVariant] = useState(0)
  const v = step.variants?.[variant]
  const figure = v ? { ...step.figure, kind: v.kind, x1: v.x1 } : step.figure
  const text = v ? [...step.text, v.text] : step.text

  return (
    <StepCard
      title={step.title}
      stage={step.stage}
      text={text}
      figure={
        <div className="space-y-2">
          <StepFigure key={variant} figure={figure} actions={step.actions} />
          {step.variants && (
            <button
              type="button"
              onClick={() => setVariant((i) => (i + 1) % step.variants.length)}
              className="min-h-12 rounded-button border-2 border-heading bg-white px-4 font-extrabold text-heading"
            >
              {step.actionLabel}: {v.label}
            </button>
          )}
        </div>
      }
    >
      {step.question && <ChoiceQuestion question={step.question} record={record} onAttempt={onAttempt} />}
    </StepCard>
  )
}
