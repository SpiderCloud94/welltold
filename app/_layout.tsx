
import { ClerkProvider } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Use your real publishable key via env (no literals here).
const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY as string;

// Cache Clerk tokens in SecureStore so you stay signed in across launches
const tokenCache = {
  async getToken(key: string) {
    try { return await SecureStore.getItemAsync(key); } catch { return null; }
  },
  async saveToken(key: string, value: string) {
    try { await SecureStore.setItemAsync(key, value); } catch {}
  },
};

export default function RootLayout() {
  // Don’t render anything until a valid key exists (prevents runtime key errors)
  if (!PUBLISHABLE_KEY) {
    console.error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
    return null;
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} tokenCache={tokenCache}>
      {/* Slot renders the rest of your /app tree */}
      <Slot />
    </ClerkProvider>
  );
}