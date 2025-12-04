import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const title = process.env.REACT_APP_APP_TITLE || 'Trident Explorer';
document.title = title;
const theme = process.env.REACT_APP_THEME_COLOR || '#001730';
document.documentElement.style.setProperty('--primary-color', theme);
const defaultTheme = localStorage.getItem('theme') || process.env.REACT_APP_DEFAULT_THEME || 'dark';
document.documentElement.setAttribute('data-theme', defaultTheme);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA offline support
serviceWorkerRegistration.register();

document.getElementById('splash').style.display = 'none';
document.getElementById('root').style.display = 'block';
