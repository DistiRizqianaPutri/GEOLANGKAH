import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import Welcome from './pages/Welcome.jsx'

// Halaman uji gambar sementara aktif juga di produksi agar bisa dicoba di HP
// lewat Vercel. Sembunyikan lagi di M10 (kembalikan syarat import.meta.env.DEV).
const Lab = lazy(() => import('./pages/Lab.jsx'))

// Daftar rute aplikasi. Rute lain ditambahkan di M4 (peta, pertemuan) dan M7 (peneliti).
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route
          path="/lab"
          element={
            <Suspense fallback={null}>
              <Lab />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
