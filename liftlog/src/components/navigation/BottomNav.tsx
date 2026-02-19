import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  {
    path: '/',
    label: 'Home',
    // Single path — house icon
    paths: ['M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25'],
  },
  {
    path: '/workout',
    label: 'Workout',
    // Plus icon
    paths: ['M12 4.5v15m7.5-7.5h-15'],
  },
  {
    path: '/exercises',
    label: 'Exercises',
    // Dumbbell icon (three sub-paths: left plate, right plate, bar)
    paths: ['M4 9h2v6H4zM18 9h2v6h-2zM6 11h12v2H6z'],
  },
  {
    path: '/history',
    label: 'History',
    // Clock icon
    paths: ['M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'],
  },
  {
    path: '/profile',
    label: 'Profile',
    // Person icon
    paths: ['M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'],
  },
] as const;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 flex justify-around border-t border-zinc-800 bg-surface py-2">
      {tabs.map((tab) => {
        // Home only matches exactly; all others match their prefix (e.g. /exercises/:id stays highlighted)
        const isActive =
          tab.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.path);
        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => navigate(tab.path)}
            className={`flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 text-xs transition-colors ${
              isActive
                ? 'text-primary'
                : 'text-on-surface/50 active:text-on-surface/80'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              {tab.paths.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </svg>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
