// app/(auth)/sign-in.tsx
import { useOAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, Text, View } from 'react-native';

export default function SignIn() {
  // One hook per provider
  const { startOAuthFlow: startGoogle } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startApple } = useOAuth({ strategy: 'oauth_apple' });

  const [loading, setLoading] = React.useState<'google' | 'apple' | null>(null);

  async function runOAuth(flow: 'google' | 'apple') {
    try {
      setLoading(flow);
      const start = flow === 'google' ? startGoogle : startApple;

      const { createdSessionId, setActive, signIn, signUp } = await start();

             // Clerk returns either a created session or a signIn/signUp that may require more steps.
       if (createdSessionId && setActive) {
         await setActive({ session: createdSessionId });
         router.replace('/(app)/(tabs)/vault'); // authenticated → Vault tab
         return;
       }

      // If we’re here, the flow needs additional steps (rare for Google/Apple on mobile).
      // You can inspect signIn/signUp for next requirements. For now, just bail gracefully.
      console.warn('[Clerk] OAuth requires additional steps.', { signIn, signUp });
    } catch (err) {
      console.error('[Clerk] OAuth error:', err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 16 }}>Sign in</Text>

        {/* Google */}
        <Pressable
          onPress={() => runOAuth('google')}
          disabled={loading !== null}
          style={{
            padding: 14,
            borderRadius: 999,
            backgroundColor: '#2563EB',
            alignItems: 'center',
            opacity: loading ? 0.8 : 1,
            marginBottom: 12,
          }}
        >
          {loading === 'google' ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ color: 'white', fontWeight: '700' }}>Continue with Google</Text>
          )}
        </Pressable>

        {/* Apple */}
        <Pressable
          onPress={() => runOAuth('apple')}
          disabled={loading !== null}
          style={{
            padding: 14,
            borderRadius: 999,
            backgroundColor: 'black',
            alignItems: 'center',
            opacity: loading ? 0.8 : 1,
          }}
        >
          {loading === 'apple' ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontWeight: '700' }}>Continue with Apple</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
