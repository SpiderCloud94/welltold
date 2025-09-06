import type { TokenCache } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

export const tokenCache: TokenCache = {
  async getToken(key: string) {
    try { return await SecureStore.getItemAsync(key); } catch { return null; }
  },
  async saveToken(key: string, value: string) {
    try { await SecureStore.setItemAsync(key, value); } catch { /* ignore */ }
  },
};
