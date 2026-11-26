import ChoiceQuestion from './ChoiceQuestion.jsx'
import StepCard from './StepCard.jsx'
import StepFigure from './StepFigure.jsx'

/** Pertanyaan "Mengapa?" (F-10): pilihan ganda singkat setelah langkah kunci. */
export default function WhyStep({ step, record, onAttempt }) {
  return (
    <StepCard title={step.title} text={step.text} stage={step.stage} figure={step.figure && <StepFigure figure={step.figure} />}>
      <ChoiceQuestion question={step.question} record={record} onAttempt={onAttempt} />
    </StepCard>
  )
}
