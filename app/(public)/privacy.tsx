import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../lib/theme';
import BodyText from '../../primitives/BodyText';
import Heading from '../../primitives/Heading';

export default function PrivacyPage() {
  const router = useRouter();

  const BODY = `Privacy Policy (short version)

• Your recordings are yours. You control them.
• You can delete stories at any time.
• We use analytics to improve the app, never to sell your data.
• Full policy text goes here. Replace this placeholder with your final copy.`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.m, paddingTop: theme.spacing.s, paddingBottom: theme.spacing.l }}>
        <Pressable onPress={() => router.push('/(public)/about' as const)} style={{ padding: theme.spacing.s }}>
          <Text style={{ fontSize: 18 }}>←</Text>
        </Pressable>
        <Heading size="xl" style={{ flex: 1, textAlign: 'center' }}>Privacy Policy</Heading>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.m, paddingBottom: theme.spacing.xl }}>
        <Heading size="m" style={{ marginBottom: theme.spacing.s }}>Privacy Policy</Heading>
        <BodyText>{BODY}</BodyText>
      </ScrollView>
    </SafeAreaView>
  );
}

