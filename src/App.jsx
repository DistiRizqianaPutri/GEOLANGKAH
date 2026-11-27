import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import RequireSession from './components/ui/RequireSession.jsx'
import { SessionProvider } from './components/ui/SessionProvider.jsx'
import AdventureMap from './pages/AdventureMap.jsx'
import LeppinkPage from './pages/LeppinkPage.jsx'
import Meeting from './pages/Meeting.jsx'
import ResultPage from './pages/ResultPage.jsx'
import TestPage from './pages/TestPage.jsx'
import Welcome from './pages/Welcome.jsx'

// Halaman uji gambar sementara aktif juga di produksi agar bisa dicoba di HP
// lewat Vercel. Sembunyikan lagi di M10 (kembalikan syarat import.meta.env.DEV).
const Lab = lazy(() => import('./pages/Lab.jsx'))
// Halaman peneliti dimuat terpisah agar tidak memperberat aplikasi siswa.
const Dashboard = lazy(() => import('./pages/researcher/Dashboard.jsx'))

// Daftar rute aplikasi. M7: /tes/pre|post, /skala/:n (siswa) dan /peneliti.
export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route
            path="/peta"
            element={
              <RequireSession>
                <AdventureMap />
              </RequireSession>
            }
          />
          <Route
            path="/pertemuan/:n"
            element={
              <RequireSession>
                <Meeting />
              </RequireSession>
            }
          />
          <Route
            path="/hasil/:n"
            element={
              <RequireSession>
                <ResultPage />
              </RequireSession>
            }
          />
          <Route
            path="/tes/:kind"
            element={
              <RequireSession>
                <TestPage />
              </RequireSession>
            }
          />
          <Route
            path="/skala/:n"
            element={
              <RequireSession>
                <LeppinkPage />
              </RequireSession>
            }
          />
          <Route
            path="/peneliti"
            element={
              <Suspense fallback={null}>
                <Dashboard />
              </Suspense>
            }
          />
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
    </SessionProvider>
  )
}
