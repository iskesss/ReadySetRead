import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
 
import SignUpPage from './pages/login.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode> 
    <SignUpPage />
  </StrictMode>,
)
