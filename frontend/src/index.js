import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const title = process.env.REACT_APP_APP_TITLE || 'Trident Explorer';
document.title = title;
const theme = process.env.REACT_APP_THEME_COLOR || '#001730';
document.documentElement.style.setProperty('--primary-color', theme);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
document.getElementById('splash').style.display = 'none';
document.getElementById('root').style.display = 'block';
