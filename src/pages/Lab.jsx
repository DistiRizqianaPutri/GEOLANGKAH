import { useState } from 'react'
import FigureCanvas from '../components/figure/FigureCanvas.jsx'
import { formatMeasure, rectMeasures, rightTriangleMeasures, trapezoidFromSides, trapezoidMeasures } from '../lib/geometry.js'

// Halaman uji gambar (M3) — HANYA mode pengembangan, tidak ikut build produksi.
// Angka preset dari KONTEN.md §2–5.
const PRESETS = [
  { name: 'Persegi panjang 6 × 4 (P1)', make: () => ({ shape: 'rect', p: 6, l: 4 }) },
  { name: 'Sama kaki 16/10/4 (P2–P4)', make: () => trapezoidFromSides({ kind: 'isosceles', a: 16, b: 10, t: 4 }) },
  { name: 'Siku-siku 12/7/12 (P2–P4)', make: () => trapezoidFromSides({ kind: 'right', a: 12, b: 7, t: 12 }) },
  { name: 'Sembarang 24/10/12, kaki 13 & 15 (P2)', make: () => trapezoidFromSides({ kind: 'scalene', a: 24, b: 10, t: 12, x1: 5 }) },
  { name: 'Sama kaki 22/10/8 (P3–P4)', make: () => trapezoidFromSides({ kind: 'isosceles', a: 22, b: 10, t: 8 }) },
  { name: 'Sama kaki 30/14/15 (P4, besar)', make: () => trapezoidFromSides({ kind: 'isosceles', a: 30, b: 14, t: 15 }) },
  { name: 'Siku-siku 20/12/15 (P4)', make: () => trapezoidFromSides({ kind: 'right', a: 20, b: 12, t: 15 }) },
  { name: 'Sama kaki 10/6/4 (kaki ≈)', make: () => trapezoidFromSides({ kind: 'isosceles', a: 10, b: 6, t: 4 }) },
  { name: 'Segitiga siku-siku 3-4-5 (P4)', make: () => ({ shape: 'triangle', x: 3, t: 4 }) },
  { name: 'Siku-siku 9/5/3 kolam (⑤)', make: () => trapezoidFromSides({ kind: 'right', a: 9, b: 5, t: 3 }) },
]

const LAYERS = ['grid', 'parallel', 'height', 'rightAngle', 'legs', 'labels', 'area', 'perimeter', 'decompose', 'doubleRotate']
const ANIMATIONS = [
  { key: 'perimeter', label: 'Telusuri tepi' },
  { key: 'area', label: 'Isi petak', rectOnly: true },
  { key: 'decompose', label: 'Pecah' },
  { key: 'doubleRotate', label: 'Gandakan & putar' },
]

export default function Lab() {
  const [preset, setPreset] = useState(1)
  const [shape, setShape] = useState(PRESETS[1].make)
  const [layers, setLayers] = useState(['grid', 'parallel', 'height', 'rightAngle', 'legs', 'labels'])
  const [draggable, setDraggable] = useState(true)
  const [unit, setUnit] = useState('cm')
  const [run, setRun] = useState({ perimeter: 0, area: 0, decompose: 0, doubleRotate: 0 })
  const [lockHeight, setLockHeight] = useState(false)
  const [drags, setDrags] = useState(0)
  const [hideHeight, setHideHeight] = useState(false)

  const choosePreset = (i) => {
    setPreset(i)
    setShape(PRESETS[i].make())
  }
  const toggleLayer = (name) =>
    setLayers((ls) => (ls.includes(name) ? ls.filter((l) => l !== name) : [...ls, name]))
  const play = (key) => {
    if (!layers.includes(key)) setLayers((ls) => [...ls, key])
    setRun((r) => ({ ...r, [key]: r[key] + 1 }))
  }
  const handleChange = (next) => {
    setShape(next)
    setDrags((n) => n + 1)
  }

  const isRect = shape.shape === 'rect'
  const isTriangle = shape.shape === 'triangle'
  const m = isRect ? rectMeasures(shape) : isTriangle ? rightTriangleMeasures(shape) : trapezoidMeasures(shape)
  const readout = isRect
    ? [['p', m.p], ['l', m.l], ['K', m.perimeter], ['L', m.area, '²']]
    : isTriangle
      ? [['x', m.x], ['t', m.t], ['s (sisi miring)', m.s]]
      : [['a', m.a], ['b', m.b], ['t', m.t], ['s₁ (AD)', m.s1], ['s₂ (BC)', m.s2], ['x₁', m.x1], ['x₂', m.x2], ['K', m.perimeter], ['L', m.area, '²']]

  return (
    <main className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="text-step-title font-extrabold text-heading">Lab gambar (pengembangan)</h1>

      <section className="rounded-card border border-surface-border bg-surface p-2">
        <FigureCanvas
          shape={shape}
          layers={layers}
          unit={unit}
          draggable={draggable && !isTriangle}
          lockHeight={lockHeight}
          hideLabels={hideHeight ? ['t', 's1'] : []}
          onChange={handleChange}
          run={run}
          counting={isRect && run.area > 0 ? ['area'] : []}
        />
      </section>

      <section aria-label="Angka dari geometry.js" className="rounded-card border border-surface-border bg-surface p-4">
        <h2 className="font-extrabold text-heading">Angka dari geometry.js</h2>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 text-body">
          {readout.map(([k, v, sq = '']) => (
            <div key={k} className="flex justify-between">
              <dt className="text-text-muted">{k}</dt>
              <dd className="font-extrabold">
                {formatMeasure(v)} {unit}
                {sq}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-text-muted">Seretan tercatat: {drags}</p>
      </section>

      <section className="flex flex-wrap gap-2">
        {ANIMATIONS.map(({ key, label, rectOnly }) => (
          <button
            key={key}
            type="button"
            onClick={() => play(key)}
            disabled={rectOnly ? !isRect : isRect && key !== 'perimeter'}
            className="min-h-12 rounded-button bg-linear-to-b from-primary-from to-primary-to px-4 font-extrabold text-primary-text shadow-[0_3px_0_var(--color-primary-shadow)] disabled:opacity-40"
          >
            {label}
          </button>
        ))}
      </section>

      <section className="rounded-card border border-surface-border bg-surface p-4">
        <label className="flex min-h-12 items-center gap-3">
          <span className="w-20 text-text-muted">Bangun</span>
          <select
            value={preset}
            onChange={(e) => choosePreset(Number(e.target.value))}
            className="min-h-12 w-0 min-w-0 flex-1 rounded-button border border-surface-border bg-surface px-2"
          >
            {PRESETS.map((p, i) => (
              <option key={p.name} value={i}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-12 items-center gap-3">
          <input type="checkbox" className="size-6" checked={draggable} onChange={(e) => setDraggable(e.target.checked)} />
          Bisa digeser
        </label>
        <label className="flex min-h-12 items-center gap-3">
          <input type="checkbox" className="size-6" checked={lockHeight} onChange={(e) => setLockHeight(e.target.checked)} />
          Tinggi terkunci (lockHeight)
        </label>
        <label className="flex min-h-12 items-center gap-3">
          <input type="checkbox" className="size-6" checked={hideHeight} onChange={(e) => setHideHeight(e.target.checked)} />
          Sembunyikan t dan s₁ (hideLabels → "= ?")
        </label>
        <div className="flex min-h-12 items-center gap-3">
          <span className="w-20 text-text-muted">Satuan</span>
          {['cm', 'm'].map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              aria-pressed={unit === u}
              className="min-h-12 min-w-12 rounded-button border border-surface-border px-3 aria-pressed:bg-primary-from aria-pressed:font-extrabold"
            >
              {u}
            </button>
          ))}
        </div>
      </section>

      <fieldset className="rounded-card border border-surface-border bg-surface p-4">
        <legend className="px-1 font-extrabold text-heading">Lapisan</legend>
        <div className="grid grid-cols-2 gap-x-2">
          {LAYERS.map((name) => (
            <label key={name} className="flex min-h-12 items-center gap-3">
              <input type="checkbox" className="size-6" checked={layers.includes(name)} onChange={() => toggleLayer(name)} />
              {name}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Ruang kosong agar bisa dicek: menyeret titik tidak ikut menggulir halaman. */}
      <p className="pb-96 text-text-muted">Gulir halaman ini, lalu seret titik di gambar. Halaman tidak boleh ikut tergulir.</p>
    </main>
  )
}
