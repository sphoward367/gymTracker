import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { WorkoutProvider } from './contexts/WorkoutContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <WorkoutProvider>
        <App />
      </WorkoutProvider>
    </AuthProvider>
  </StrictMode>,
);
