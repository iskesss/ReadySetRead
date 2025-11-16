import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './styles/App.css'

import SignUpPage from './pages/signup.tsx'
import LoginPage from './pages/login.tsx'
import ParentLanding from './pages/ParentLanding.tsx'
import LibraryPage from './pages/library.tsx'
import QuizPage from './pages/Quiz.tsx'

// Placeholder
import PHStudentLandingPage from './pages/PlaceholderStudentLanding.tsx';



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/parentLanding" element={<ParentLanding />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/studentLanding" element={<PHStudentLandingPage />} />
        <Route path="/quiz" element={<QuizPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
