interface PRBadgeProps {
  count?: number;
  size?: 'sm' | 'md';
}

export function PRBadge({ count, size = 'sm' }: PRBadgeProps) {
  const sizeClasses =
    size === 'md'
      ? 'text-sm px-3 py-1 rounded-full'
      : 'text-xs px-2 py-0.5 rounded-full';

  return (
    <span
      className={`inline-flex items-center gap-1 bg-pr-gold/20 border border-pr-gold/40 text-pr-gold font-semibold ${sizeClasses}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      PR{count !== undefined && count > 1 ? ` ×${count}` : ''}
    </span>
  );
}
