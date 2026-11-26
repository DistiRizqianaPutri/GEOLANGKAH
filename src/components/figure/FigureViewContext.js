import { createContext } from 'react'

/** Lebar viewBox gambar (px), dipakai MeasureLabel agar label tidak terpotong di tepi. */
const FigureViewContext = createContext({ width: Infinity })

export default FigureViewContext
