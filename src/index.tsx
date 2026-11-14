import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initCoreWebVitals } from './utils/webVitals';
import { register as registerSW } from './utils/serviceWorker';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

initCoreWebVitals();

if (process.env.NODE_ENV === 'production') {
  registerSW();
}

reportWebVitals();
