import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import Welcome from './pages/Welcome.jsx'

// Daftar rute aplikasi. Rute lain ditambahkan di M4 (peta, pertemuan) dan M7 (peneliti).
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
