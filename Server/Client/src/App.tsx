import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'
import Navbar from './components/Navbar.tsx'
import UploadPage from './pages/UploadPage.tsx'
import AnalysisPage from './pages/AnalysisPage.tsx'
import SuggestedPaperPage from './pages/SuggestedPaperPage.tsx'
import AnswersPage from './pages/AnswersPage.tsx'
import LandingPage from './pages/LandingPage.tsx'
import AuthPage from './pages/AuthPage.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import type { AnalysisResult, GeneratedPaper, AnswerSet } from './api/client'

export interface AppState {
  sessionId: string | null
  analysis: AnalysisResult | null
  paper: GeneratedPaper | null
  answers: AnswerSet | null
}

function App() {
  const [state, setState] = useState<AppState>({
    sessionId: null,
    analysis: null,
    paper: null,
    answers: null,
  })

  const updateState = (partial: Partial<AppState>) =>
    setState(prev => ({ ...prev, ...partial }))

  const currentStep = state.answers
    ? 4
    : state.paper
    ? 3
    : state.analysis
    ? 2
    : 1

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e1e3a',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '0.9rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<><Navbar currentStep={currentStep} /><div className="page-content"><UploadPage state={state} updateState={updateState} /></div></>} path="/dashboard" />
            <Route element={<><Navbar currentStep={currentStep} /><div className="page-content"><AnalysisPage state={state} updateState={updateState} /></div></>} path="/analysis" />
            <Route element={<><Navbar currentStep={currentStep} /><div className="page-content"><SuggestedPaperPage state={state} updateState={updateState} /></div></>} path="/paper" />
            <Route element={<><Navbar currentStep={currentStep} /><div className="page-content"><AnswersPage state={state} /></div></>} path="/answers" />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
