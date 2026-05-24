import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} initConfig={{
    ux_mode: "redirect",
    auto_select: false
  }}>
    <StrictMode>
      <App />
    </StrictMode>
  </GoogleOAuthProvider>
)
