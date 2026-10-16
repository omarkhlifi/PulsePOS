/**
 * PulsePOS — Application Entrypoint
 * @author Omar Khlifi (https://github.com/omarkhlifi)
 * @license MIT
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

