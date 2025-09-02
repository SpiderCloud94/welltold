import { Redirect } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';

export default function Root() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    // User is authenticated → go to app
    return <Redirect href="/(app)/vault" />;
  } else {
    // User not authenticated → go to public entry
    return <Redirect href="/(public)" />;
  }
}
