import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { WorkoutProvider } from './contexts/WorkoutContext';
import { TimerProvider } from '@/contexts/TimerContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error(
    'Root element #root not found. Check that index.html contains <div id="root">.',
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <WorkoutProvider>
          <TimerProvider>
            <App />
          </TimerProvider>
        </WorkoutProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
