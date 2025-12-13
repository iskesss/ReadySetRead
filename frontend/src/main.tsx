import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './styles/App.css'

import SignUpPage from './pages/signup.tsx'
import LoginPage from './pages/login.tsx'
import ParentLanding from './pages/ParentLanding.tsx'
import LibraryPage from './pages/library.tsx'
import QuizPage from './pages/Quiz.tsx'
import QuizResultsPage from './pages/QuizResults.tsx'
import Rewards from './pages/Rewards.tsx'
import Layout from "./components/layout";

import StudentLandingPage from './pages/StudentLanding.tsx';

import ParentProgress from './pages/ParentProgress.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route element={<Layout userType="student" />}>
          <Route path="/Rewards" element={<Rewards />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/studentLanding" element={<StudentLandingPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/quizResults" element={<QuizResultsPage />} />
        </Route>
        <Route element={<Layout userType="parent" />}>
          <Route path="/parentLanding" element={<ParentLanding />} />
          <Route path="/ParentProgress" element={<ParentProgress />} />
          <Route path="/ParentLibrary" element={<LibraryPage />} />
        </Route>
      </Routes >
    </BrowserRouter >
  </StrictMode >,
)
