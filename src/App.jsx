import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import Welcome from './pages/Welcome.jsx'

// Halaman uji gambar hanya ada di mode pengembangan; di build produksi
// cabang ini dibuang sehingga kode Lab tidak ikut terkirim.
const Lab = import.meta.env.DEV ? lazy(() => import('./pages/Lab.jsx')) : null

// Daftar rute aplikasi. Rute lain ditambahkan di M4 (peta, pertemuan) dan M7 (peneliti).
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        {Lab && (
          <Route
            path="/lab"
            element={
              <Suspense fallback={null}>
                <Lab />
              </Suspense>
            }
          />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
