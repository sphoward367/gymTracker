import { useAuth } from '@/contexts/AuthContext';

export default function Profile() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 text-on-background">
      <div className="px-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-2 text-on-surface/60">
          {user?.email ?? 'Not signed in'}
        </p>
        <button
          onClick={() => void signOut()}
          className="mt-6 min-h-[44px] rounded-lg bg-surface px-6 py-3 font-medium text-on-surface transition-colors hover:bg-surface-variant"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
