import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect } from 'react';

const ONBOARDING_KEY = 'onboardingDone';

export default function Boot() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    (async () => {
      if (!isLoaded) return;

      if (isSignedIn) {
        // ✅ Signed in → Vault tab (tab bar visible)
        router.replace('/(app)/(tabs)/vault');
        return;
      }

      // ❌ Not authed → check onboarding flag
      const done = (await AsyncStorage.getItem(ONBOARDING_KEY)) === '1';
      if (!done) {
        router.replace('/agree');
        return;
      }

      // Onboarding done → straight to provider buttons
      router.replace('/(auth)/sign-in');
    })();
  }, [isLoaded, isSignedIn]);

  return null;
}