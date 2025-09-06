const must = (name: string): string => {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing env var: ${name}`);
  return v.trim();
};

// Required (you already set this in .env.local)
export const CLERK_PUBLISHABLE_KEY = must('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');

// Optional "panic switch" (defaults OFF). If set to "1", UI renders without Clerk
// instead of blocking. Use only if you want the app to fail-open temporarily.
export const FAIL_OPEN_AUTH = process.env.EXPO_PUBLIC_FAIL_OPEN_AUTH === '1';
