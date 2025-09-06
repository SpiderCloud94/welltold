import { router } from 'expo-router';
import { useEffect } from 'react';

export default function AppIndex() {
  useEffect(() => {
    router.replace('/(app)/(tabs)/vault');
  }, []);

  return null;
}
