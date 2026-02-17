/** Maps Firebase Auth error codes to user-friendly messages.
 *  Intentionally combines user-not-found and wrong-password
 *  to prevent user enumeration attacks. */
const errorMessages: Record<string, string> = {
  'auth/user-not-found': 'Invalid email or password.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Check your connection.',
};

export function getAuthErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code;
    return errorMessages[code] ?? 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}
