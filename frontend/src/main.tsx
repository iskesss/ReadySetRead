import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import SignUpPage from './pages/signup.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SignUpPage />
  </StrictMode>,
)
