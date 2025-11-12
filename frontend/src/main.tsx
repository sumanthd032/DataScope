// frontend/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { DbStateProvider } from './context/DbStateContext.tsx'
import mermaid from 'mermaid' // [+] Import Mermaid

// [+] Initialize Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'base', // or 'default'
  themeVariables: {
    primaryColor: '#e0e7ff', // indigo-100
    primaryTextColor: '#3730a3', // indigo-900
    lineColor: '#a5b4fc', // indigo-300
    textColor: '#374151', // gray-700
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DbStateProvider>
      <App />
    </DbStateProvider>
  </React.StrictMode>,
)