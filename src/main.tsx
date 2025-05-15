import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './lib/i18n'; // Initialize i18next
import './index.css' // Added this line
import './styles/globals.css'
import './styles/utilities.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
