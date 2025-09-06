/**
 * Dev-safe UID resolver.
 * - If EXPO_PUBLIC_FAKE_MAKE=1 → allow 'dev-user' when not logged in.
 * - If FAKE_MAKE=0 (real pipeline) → require a real uid (returns undefined).
 */

export const isDevPipeline =
  !process.env.EXPO_PUBLIC_MAKE_WEBHOOK ||
  !String(process.env.EXPO_PUBLIC_MAKE_WEBHOOK).trim() ||
  !process.env.EXPO_PUBLIC_WELLTOLD_SECRET ||
  !String(process.env.EXPO_PUBLIC_WELLTOLD_SECRET).trim() ||
  process.env.EXPO_PUBLIC_FAKE_MAKE === '1';

export function resolveUid(authUid?: string) {
  // prefer provided uid from Clerk when available
  if (authUid) return authUid;

  // dev-only fallback
  if (isDevPipeline) return 'dev-user';

  // prod strict: no uid
  return undefined;
}
