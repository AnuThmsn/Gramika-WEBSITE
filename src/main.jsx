import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css'; // if using react-bootstrap

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
