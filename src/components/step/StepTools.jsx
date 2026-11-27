import { useState } from 'react'
import { shouldOfferHint } from '../../lib/hintRules.js'
import HintButton from '../hint/HintButton.jsx'
import HintPanel from '../hint/HintPanel.jsx'
import TutorPanel from '../hint/TutorPanel.jsx'
import { canAskTutor } from '../../lib/tutor.js'

/**
 * Tombol + panel petunjuk sebuah soal. Membuka panel pertama kali = membuka L1 (dicatat).
 * Setelah soal selesai, petunjuk yang sudah dibuka tetap bisa dibaca, tanpa membuka yang baru.
 */
export default function StepTools({ hints, record, onHint, step = null }) {
  const opened = record?.max_hint_level ?? 0
  const attempts = record?.attempts ?? 0
  const done = record?.done === true
  const [open, setOpen] = useState(opened > 0 && !done)

  if (!hints || (done && opened === 0)) return null

  const toggle = () => {
    if (!open && opened === 0) onHint(1)
    setOpen(!open)
  }

  return (
    <div className="space-y-2">
      <HintButton onClick={toggle} expanded={open} offer={!done && !open && shouldOfferHint({ wrong: attempts, opened })} />
      {open && <HintPanel hints={hints} opened={Math.max(opened, done ? opened : 1)} attempts={attempts} onOpen={onHint} locked={done} />}
      {step && canAskTutor(record) && <TutorPanel step={step} record={record} />}
    </div>
  )
}
