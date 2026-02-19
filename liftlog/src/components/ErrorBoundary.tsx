import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  // Store a sanitised message only — never the raw Error object — to avoid
  // leaking internal SDK details (e.g. Firestore paths, project IDs) to the UI.
  errorMessage: string | null;
}

/** Maximum length for user-visible error messages to prevent info-leakage. */
const MAX_ERROR_MESSAGE_LENGTH = 120;

function sanitiseErrorMessage(error: Error): string {
  const raw = error.message ?? '';
  // Truncate long messages and strip anything that looks like a Firebase
  // internal path or project identifier.
  const truncated = raw.length > MAX_ERROR_MESSAGE_LENGTH
    ? raw.slice(0, MAX_ERROR_MESSAGE_LENGTH) + '…'
    : raw;
  return truncated || 'An unexpected error occurred.';
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: sanitiseErrorMessage(error) };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log the full error internally but never expose it to the render tree.
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-error"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-xl font-bold text-on-surface">Something went wrong</p>
          <p className="text-sm text-zinc-400">
            {this.state.errorMessage ?? 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="min-h-[44px] min-w-[44px] rounded-lg bg-primary px-6 py-3 font-medium text-on-primary active:opacity-80 transition-opacity"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
