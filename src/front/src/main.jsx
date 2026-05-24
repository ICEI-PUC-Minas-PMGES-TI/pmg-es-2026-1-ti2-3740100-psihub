import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './assets/styles/global.css';
import { initFrontendMetrics } from './shared/utils/metrics.utils';

initFrontendMetrics(); // Inicializa Core Web Vitals/proxies no bootstrap para medir a experiencia real desde o primeiro carregamento.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
