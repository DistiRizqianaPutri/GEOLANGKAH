import StepCard from './StepCard.jsx'
import StepFigure from './StepFigure.jsx'

/** Langkah penjelasan: gambar (+ tombol animasi) dan teks. Lanjut selalu boleh. */
export default function ExplainStep({ step }) {
  return (
    <StepCard
      title={step.title}
      stage={step.stage}
      text={step.text}
      figure={step.figure && <StepFigure figure={step.figure} actions={step.actions} />}
    />
  )
}
