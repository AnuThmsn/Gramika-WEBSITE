import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css'; // if using react-bootstrap

// One-time initialization: clear any stray demo cart on first app load
try {
  const initialized = localStorage.getItem('gramika_initialized');
  if (!initialized) {
    // remove any pre-existing guest cart (could be leftover from demos)
    localStorage.removeItem('gramika_cart');
    localStorage.setItem('gramika_initialized', '1');
  }
} catch (e) {
  // ignore if localStorage unavailable
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
