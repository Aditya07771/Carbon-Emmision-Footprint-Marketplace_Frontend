// ADD THESE TWO LINES AT THE VERY TOP
import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Your existing imports follow below...
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)