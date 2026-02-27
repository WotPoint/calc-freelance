import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Монтируем React-приложение в <div id="root"> из index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
