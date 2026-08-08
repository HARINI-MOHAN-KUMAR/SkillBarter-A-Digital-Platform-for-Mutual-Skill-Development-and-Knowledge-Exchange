import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />

    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          fontFamily: 'DM Sans, sans-serif',
          background: '#0f0e0c',
          color: '#f5f1e8',
          borderRadius: '12px',
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: '#1a7a62',
            secondary: '#f5f1e8',
          },
        },
        error: {
          iconTheme: {
            primary: '#c84b2f',
            secondary: '#f5f1e8',
          },
        },
      }}
    />
  </React.StrictMode>
)
