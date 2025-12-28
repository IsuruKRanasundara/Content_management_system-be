import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { testApiConnection } from './utils/apiTest'

// Make test function available globally
if (typeof window !== 'undefined') {
  (window as any).testApiConnection = testApiConnection;
  console.log('💡 Run testApiConnection() in console to test API connection');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
