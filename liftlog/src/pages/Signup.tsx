import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/utils/authErrors';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-3xl font-bold text-on-background">
          Create Account
        </h1>
        <p className="mb-8 text-center text-on-surface/60">
          Start tracking your workouts today.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-sm text-on-surface/70">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="min-h-[44px] rounded-lg border border-surface-variant bg-surface px-4 py-3 text-on-surface placeholder-on-surface/40 outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-on-surface/70">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="min-h-[44px] rounded-lg border border-surface-variant bg-surface px-4 py-3 text-on-surface placeholder-on-surface/40 outline-none focus:border-primary"
              placeholder="At least 6 characters"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-on-surface/70">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="min-h-[44px] rounded-lg border border-surface-variant bg-surface px-4 py-3 text-on-surface placeholder-on-surface/40 outline-none focus:border-primary"
              placeholder="Confirm your password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] rounded-lg bg-primary px-4 py-3 font-semibold text-on-primary transition-opacity disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface/60">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
