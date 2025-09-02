import { Redirect } from 'expo-router';
import React from 'react';

export default function PublicEntry() {
  // TEMP: force Hero every time for testing
  return <Redirect href="/(public)/hero" />;
}
