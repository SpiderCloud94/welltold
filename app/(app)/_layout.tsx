import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';

export default function PrivateAppLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  // Wait for Clerk to hydrate before deciding
  if (!isLoaded) return null;

  // Not signed in? Send to your provider buttons screen
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  // Signed in: render the stack (your tabs live inside this group)
  return <Stack screenOptions={{ headerShown: false }} />;
}

