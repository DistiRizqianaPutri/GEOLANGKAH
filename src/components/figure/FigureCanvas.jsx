import { useId, useRef } from 'react'
import {
  DRAG_LIMITS,
  dragRectCorner,
  dragTopVertex,
  formatLabel,
  rectMeasures,
  trapezoidMeasures,
} from '../../lib/geometry.js'
import DragHandle from './DragHandle.jsx'
import FigureViewContext from './FigureViewContext.js'
import { nearestSegment } from './hitTest.js'
import { legLabelLayout } from './labelFit.js'
import useFigureScale from './useFigureScale.js'
import AreaLayer from './layers/AreaLayer.jsx'
import BaseOutline from './layers/BaseOutline.jsx'
import DecomposeLayer, { DECOMPOSE_GAP } from './layers/DecomposeLayer.jsx'
import DoubleRotateLayer from './layers/DoubleRotateLayer.jsx'
import GridLayer from './layers/GridLayer.jsx'
import HeightLayer from './layers/HeightLayer.jsx'
import LegsLayer from './layers/LegsLayer.jsx'
import ParallelLayer from './layers/ParallelLayer.jsx'
import PerimeterLayer from './layers/PerimeterLayer.jsx'
import RectSideLabels from './layers/RectSideLabels.jsx'
import RightAngleLayer from './layers/RightAngleLayer.jsx'
import TapTargetsLayer from './layers/TapTargetsLayer.jsx'
import VertexLabels from './layers/VertexLabels.jsx'

const KIND_NAME = {
  isosceles: 'Trapesium sama kaki',
  right: 'Trapesium siku-siku',
  scalene: 'Trapesium sembarang',
}

const SEGMENT_NAME = {
  a: 'Sisi AB',
  b: 'Sisi DC',
  s1: 'Sisi AD',
  s2: 'Sisi BC',
  t: 'Garis putus-putus dari D ke alas',
}

/** Daerah gambar (satuan petak). Saat bisa digeser, ukurannya tetap agar gambar tidak melompat. */
function figureBounds(shape, m, layers, draggable) {
  if (shape.shape === 'rect') {
    return {
      minX: 0,
      maxX: draggable ? DRAG_LIMITS.rectMaxP : shape.p,
      maxY: draggable ? DRAG_LIMITS.rectMaxL : shape.l,
    }
  }
  const b = { minX: 0, maxX: shape.a, maxY: draggable ? Math.max(DRAG_LIMITS.maxHeight, shape.t) : shape.t }
  if (layers.has('decompose')) {
    b.minX -= DECOMPOSE_GAP
    b.maxX += DECOMPOSE_GAP
  }
  if (layers.has('doubleRotate')) {
    b.maxX = Math.max(b.maxX, shape.a + m.b)
    b.minY = -1
  }
  return b
}

/** Segmen yang bisa diketuk (px). Garis tinggi hanya ada bila lapisannya tampil dan bukan siku-siku. */
function tapSegments(shape, m, layers, toPx) {
  const { A, B, C, D } = m.points
  const list = [
    ['a', A, B],
    ['b', D, C],
    ['s1', A, D],
    ['s2', B, C],
  ]
  if (layers.has('height') && shape.kind !== 'right') list.push(['t', D, m.foot])
  return list.map(([key, from, to]) => ({ key, from: toPx(from), to: toPx(to), label: SEGMENT_NAME[key] }))
}

/**
 * Gambar bangun interaktif (DESIGN.md §3, §5). Hanya MENGGAMBAR:
 * semua ukuran, snap, dan batas seret berasal dari geometry.js.
 *
 * @param {object}   props
 * @param {object}   props.shape      { shape:'trapezoid', kind, a, t, d, c } atau { shape:'rect', p, l }
 * @param {string[]} props.layers     grid, parallel, height, rightAngle, legs, labels, area, perimeter, decompose, doubleRotate
 * @param {string}   props.unit       'cm' | 'm' | 'satuan'
 * @param {string}   props.areaUnit   satuan luas pada label (bawaan unit + '²', mis. 'petak')
 * @param {boolean}  props.draggable  tampilkan titik seret (D & C, atau sudut persegi panjang)
 * @param {boolean}  props.lockHeight seret hanya mendatar (tinggi tetap)
 * @param {(shape:object)=>void} props.onChange  dipanggil dengan bangun baru saat diseret
 * @param {{perimeter?:number, area?:number, decompose?:number, doubleRotate?:number}} props.run
 *        penghitung tombol animasi; animasi berjalan setiap kali angkanya bertambah
 * @param {string[]} props.counting   lapisan yang labelnya menghitung naik (mis. ['perimeter', 'area'])
 * @param {{selected:string[], onToggle:(key:string)=>void, disabled?:boolean}} props.selectable  ketuk unsur
 */
export default function FigureCanvas({
  shape,
  layers = [],
  unit = 'cm',
  areaUnit,
  draggable = false,
  lockHeight = false,
  onChange,
  run = {},
  counting = [],
  selectable,
}) {
  const svgRef = useRef(null)
  const id = useId()
  const on = new Set(layers)
  const isRect = shape.shape === 'rect'
  const m = isRect ? rectMeasures(shape) : trapezoidMeasures(shape)
  const bounds = figureBounds(shape, m, on, draggable)
  const { width, height, toPx, toGrid } = useFigureScale(svgRef, bounds)

  const points = isRect ? [[0, 0], [m.p, 0], [m.p, m.l], [0, m.l]] : Object.values(m.points)
  const labels = on.has('labels')
  const counts = new Set(counting)
  // Mode menghitung: label K/L muncul setelah tombol ditekan walau lapisan `labels` mati.
  const areaLabel = isRect && on.has('area') && (labels || counts.has('area'))
  const bothCenter = areaLabel && on.has('perimeter')

  const title = isRect ? 'Persegi panjang' : KIND_NAME[shape.kind]
  const desc = isRect
    ? `${formatLabel('p', m.p, unit)}, ${formatLabel('l', m.l, unit)}`
    : `${formatLabel('a', m.a, unit)}, ${formatLabel('b', m.b, unit)}, ${formatLabel('t', m.t, unit)}`

  const legLayout = !isRect && on.has('legs') && labels ? legLabelLayout(m, toPx, unit, width) : null

  const handles = !draggable
    ? []
    : isRect
      ? [{ key: 'C', at: [m.p, m.l], move: (g) => dragRectCorner(shape, g) }]
      : ['D', 'C'].map((key) => ({ key, at: m.points[key], move: (g) => dragTopVertex(shape, key, g, { lockHeight }) }))

  const segments = selectable && !isRect ? tapSegments(shape, m, on, toPx) : []
  const handleTap = (e) => {
    if (selectable.disabled) return
    const r = svgRef.current.getBoundingClientRect()
    const p = [((e.clientX - r.left) / r.width) * width, ((e.clientY - r.top) / r.height) * height]
    const key = nearestSegment(p, segments)
    if (key) selectable.onToggle(key)
  }

  return (
    <FigureViewContext.Provider value={{ width }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="block aspect-[4/3] w-full select-none"
        style={{ touchAction: 'none' }}
        role={draggable || selectable ? 'group' : 'img'}
        aria-labelledby={`${id}t ${id}d`}
      >
        <title id={`${id}t`}>{title}</title>
        <desc id={`${id}d`}>{desc}</desc>

        {on.has('grid') && <GridLayer bounds={bounds} toPx={toPx} />}
        {on.has('area') && (
          <AreaLayer
            points={points}
            toPx={toPx}
            rect={isRect ? m : null}
            area={m.area}
            areaUnit={areaUnit ?? `${unit}²`}
            label={areaLabel}
            run={run.area ?? 0}
            counting={counts.has('area')}
            dy={bothCenter ? 12 : 0}
          />
        )}
        <BaseOutline points={points} toPx={toPx} />
        {on.has('perimeter') && (
          <PerimeterLayer
            points={points}
            perimeter={m.perimeter}
            toPx={toPx}
            unit={unit}
            labels={labels}
            run={run.perimeter ?? 0}
            counting={counts.has('perimeter')}
            dy={bothCenter ? -12 : 0}
          />
        )}

        {!isRect && (
          <>
            {on.has('decompose') && <DecomposeLayer shape={shape} toPx={toPx} run={run.decompose ?? 0} />}
            {on.has('legs') && <LegsLayer m={m} toPx={toPx} labels={labels} legLabels={legLayout?.labels ?? []} />}
            {on.has('parallel') && <ParallelLayer m={m} toPx={toPx} unit={unit} labels={labels} />}
            {on.has('height') && (
              <HeightLayer m={m} toPx={toPx} unit={unit} labels={labels} labelAt={legLayout?.cramped ? 0.75 : 0.5} />
            )}
            {on.has('rightAngle') && <RightAngleLayer m={m} toPx={toPx} />}
            {on.has('doubleRotate') && (
              <DoubleRotateLayer shape={shape} m={m} toPx={toPx} unit={unit} labels={labels} run={run.doubleRotate ?? 0} />
            )}
            <VertexLabels points={m.points} toPx={toPx} />
          </>
        )}
        {isRect && labels && <RectSideLabels m={m} toPx={toPx} unit={unit} />}

        {selectable && segments.length > 0 && (
          <>
            <TapTargetsLayer
              segments={segments}
              selected={selectable.selected}
              onToggle={selectable.onToggle}
              disabled={selectable.disabled}
            />
            <rect x={0} y={0} width={width} height={height} fill="transparent" onClick={handleTap} aria-hidden="true" />
          </>
        )}

        {handles.map(({ key, at, move }) => {
          const [cx, cy] = toPx(at)
          return (
            <DragHandle
              key={key}
              cx={cx}
              cy={cy}
              label={`Titik ${key}, geser untuk mengubah bentuk`}
              onDrag={(clientX, clientY) => onChange?.(move(toGrid(clientX, clientY)))}
              onStep={(dx, dy) => onChange?.(move({ x: at[0] + dx, y: at[1] + dy }))}
            />
          )
        })}
      </svg>
    </FigureViewContext.Provider>
  )
}
