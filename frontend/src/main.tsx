import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { DbStateProvider } from './context/DbStateContext.tsx' 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* [+] Wrap App in the provider */}
    <DbStateProvider>
      <App />
    </DbStateProvider>
  </React.StrictMode>,
)