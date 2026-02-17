import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/utils/authErrors';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
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
          LiftLog
        </h1>
        <p className="mb-8 text-center text-on-surface/60">
          Track your lifts. Beat your PRs.
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
              autoComplete="current-password"
              className="min-h-[44px] rounded-lg border border-surface-variant bg-surface px-4 py-3 text-on-surface placeholder-on-surface/40 outline-none focus:border-primary"
              placeholder="Your password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] rounded-lg bg-primary px-4 py-3 font-semibold text-on-primary transition-opacity disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface/60">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
