import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function SyncStatus() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 border-b border-zinc-700 bg-zinc-900/95 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm"
    >
      <span className="h-2 w-2 rounded-full bg-orange-400" aria-hidden="true" />
      You're offline — changes will sync when reconnected
    </div>
  );
}
