import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BodyWeightCard } from '@/components/progress/BodyWeightCard';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function handleSignOut() {
    setSignOutError(null);
    try {
      await signOut();
    } catch {
      setSignOutError('Failed to sign out. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 text-on-background">
      <div className="px-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-2 text-on-surface/60">
          {user?.email ?? 'Not signed in'}
        </p>
        {user && (
          <div className="mt-6">
            <BodyWeightCard userId={user.uid} />
          </div>
        )}
        <button
          onClick={() => void handleSignOut()}
          className="mt-6 min-h-[44px] rounded-lg bg-surface px-6 py-3 font-medium text-on-surface transition-colors hover:bg-surface-variant"
        >
          Sign Out
        </button>
        {signOutError && (
          <p className="mt-2 text-sm text-red-400">{signOutError}</p>
        )}
      </div>
    </div>
  );
}
