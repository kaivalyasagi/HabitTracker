import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background:   '#fff',
            color:        '#3D2C2C',
            borderRadius: '16px',
            boxShadow:    '0 4px 32px rgba(180,140,140,0.15)',
            fontFamily:   'DM Sans, sans-serif',
          },
          success: { iconTheme: { primary: '#FF8FAB', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
