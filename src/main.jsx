import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CalculatorGame from './components/CalculatorGame.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CalculatorGame />
  </StrictMode>,
);
