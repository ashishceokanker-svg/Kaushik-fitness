import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import './index.css'

// Global Vite Chunk Preload Error Handler - Auto reload on PWA bundle update
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const hasReloaded = sessionStorage.getItem('kf_vite_preload_reloaded');
  if (!hasReloaded) {
    sessionStorage.setItem('kf_vite_preload_reloaded', '1');
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
