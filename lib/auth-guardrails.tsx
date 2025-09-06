import { ClerkProvider } from '@clerk/clerk-expo';
import React from 'react';
import { Text, View } from 'react-native';
import { tokenCache } from './clerk';
import { CLERK_PUBLISHABLE_KEY, FAIL_OPEN_AUTH } from './env';

export function ResilientClerkProvider({ children }: { children: React.ReactNode }) {
  // Env validation + controlled fail-open
  try {
    if (!CLERK_PUBLISHABLE_KEY) throw new Error('Missing publishable key');
  } catch (err: any) {
    if (FAIL_OPEN_AUTH) return <>{children}</>; // panic switch: render without auth
    return <Fallback reason={String(err?.message ?? err)} />;
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      {children}
    </ClerkProvider>
  );
}

function Fallback({ reason }: { reason: string }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
        Auth temporarily unavailable
      </Text>
      <Text style={{ opacity: 0.8 }}>Reason: {reason}</Text>
      <Text style={{ marginTop: 12, opacity: 0.6 }}>
        Set EXPO_PUBLIC_FAIL_OPEN_AUTH=1 to bypass auth (temporary), or fix env and restart.
      </Text>
    </View>
  );
}
