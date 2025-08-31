import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { useAuth } from '../../providers/AuthProvider';

export default function AppGroupLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
