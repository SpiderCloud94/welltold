import { Slot } from 'expo-router';
import React from 'react';
import { AccessProvider } from '../providers/AccessProvider';
import { AuthProvider } from '../providers/AuthProvider';

export default function Root() {
  return (
    <AuthProvider>
      <AccessProvider>
        <Slot />
      </AccessProvider>
    </AuthProvider>
  );
}