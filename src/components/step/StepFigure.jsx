import { useState } from 'react'
import { figureModel } from '../../lib/figureSpec.js'
import FigureCanvas from '../figure/FigureCanvas.jsx'

/**
 * Gambar sebuah langkah: model dari konten JSON, posisi seret, dan tombol animasi.
 * Animasi hanya berjalan setelah tombol ditekan (DESIGN.md §5).
 * Di-reset dengan mengganti `key` (tombol "Ulangi langkah").
 */
export default function StepFigure({ figure, actions = [], selectable }) {
  const [shape, setShape] = useState(() => figureModel(figure))
  const [run, setRun] = useState({})

  return (
    <div className="space-y-2">
      <FigureCanvas
        shape={shape}
        layers={figure.layers}
        unit={figure.unit}
        areaUnit={figure.areaUnit}
        draggable={figure.draggable === true}
        lockHeight={figure.lockHeight === true}
        onChange={setShape}
        run={run}
        counting={figure.counting}
        selectable={selectable}
        hideLabels={figure.hideLabels}
      />
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map(({ run: key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setRun((r) => ({ ...r, [key]: (r[key] ?? 0) + 1 }))}
              className="min-h-12 rounded-button border-2 border-heading bg-white px-4 font-extrabold text-heading"
            >
              {run[key] ? `${label} lagi` : label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
