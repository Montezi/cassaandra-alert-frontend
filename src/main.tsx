import '@fontsource-variable/red-hat-display';
import '@fontsource-variable/red-hat-text';
import './shared/theme/tokens.css';
import './shared/theme/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element in index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
