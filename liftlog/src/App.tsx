import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/navigation/BottomNav';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Home from '@/pages/Home';
import ActiveWorkout from '@/pages/ActiveWorkout';
import History from '@/pages/History';
import Profile from '@/pages/Profile';
import ExerciseLibrary from '@/pages/ExerciseLibrary';
import ExerciseDetail from '@/pages/ExerciseDetail';
import type { ReactNode } from 'react';

function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <AuthGate>
              <Home />
            </AuthGate>
          }
        />
        <Route
          path="/workout"
          element={
            <AuthGate>
              <ActiveWorkout />
            </AuthGate>
          }
        />
        <Route
          path="/history"
          element={
            <AuthGate>
              <History />
            </AuthGate>
          }
        />
        <Route
          path="/exercises"
          element={
            <AuthGate>
              <ExerciseLibrary />
            </AuthGate>
          }
        />
        <Route
          path="/exercises/:id"
          element={
            <AuthGate>
              <ExerciseDetail />
            </AuthGate>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthGate>
              <Profile />
            </AuthGate>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
