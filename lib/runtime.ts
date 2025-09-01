/**
 * Dev-safe UID resolver.
 * - If EXPO_PUBLIC_FAKE_MAKE=1 → allow 'dev-user' when not logged in.
 * - If FAKE_MAKE=0 (real pipeline) → require a real uid (returns undefined).
 */
import { getApps, getApp, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseApp =
  getApps().length ? getApp() : initializeApp({}); // noop if app already init'd elsewhere

export const isDevPipeline =
  !process.env.EXPO_PUBLIC_MAKE_WEBHOOK ||
  !String(process.env.EXPO_PUBLIC_MAKE_WEBHOOK).trim() ||
  !process.env.EXPO_PUBLIC_WELLTOLD_SECRET ||
  !String(process.env.EXPO_PUBLIC_WELLTOLD_SECRET).trim() ||
  process.env.EXPO_PUBLIC_FAKE_MAKE === '1';

export function resolveUid(authUid?: string) {
  // prefer provided uid from your provider when available
  if (authUid) return authUid;

  // try Firebase Auth if present
  try {
    const auth = getAuth(firebaseApp);
    if (auth.currentUser?.uid) return auth.currentUser.uid;
  } catch {
    // no firebase/auth wired — ignore
  }

  // dev-only fallback
  if (isDevPipeline) return 'dev-user';

  // prod strict: no uid
  return undefined;
}
