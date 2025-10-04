import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Use Vite env if available, otherwise fall back to the client id provided by the user
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '127336457562-2fcbrk4bq0748eok6vue64c0led7krg5.apps.googleusercontent.com'
console.log('VITE_GOOGLE_CLIENT_ID (resolved)=', clientId)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
