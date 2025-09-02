// app/(public)/about.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../lib/theme';
import Heading from '../../primitives/Heading';

type RowItem = { id: string; label: string; icon: string; to: string };

const ROWS: RowItem[] = [
  { id: 'what',   label: 'What Our App Does',     icon: 'ℹ️', to: '/(public)/whatourappdoes' },
  { id: 'faq',    label: 'FAQ',                   icon: '❓', to: '/(public)/faq' },
  { id: 'privacy',label: 'Privacy Policy',        icon: '🛡️', to: '/(public)/privacy' },
  { id: 'terms',  label: 'Terms of Service',      icon: '📄', to: '/(public)/terms' },
  { id: 'legal',  label: 'Legal Acknowledgment',  icon: '📑', to: '/(public)/legalacknowledgment' },
];

function Row({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.colors.bg,
        borderRadius: theme.radii.md,
        padding: theme.spacing.l,
        marginBottom: theme.spacing.m,
        ...theme.shadows.cardSm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, marginRight: theme.spacing.s }}>{icon}</Text>
        <Text style={{ flex: 1, fontSize: 16, color: theme.colors.text }}>{label}</Text>
        <Text style={{ fontSize: 18, marginLeft: theme.spacing.s }}>›</Text>
      </View>
    </Pressable>
  );
}

export default function About() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();

  // back arrow routing rules
  const handleBack = () => {
    if (from === 'settings') return router.push('/(app)/settings' as const);
    if (from === 'onboarding') return router.push('/(public)/agree' as const);
    return router.push('/(public)/login' as const);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* Top App Bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.m,
          paddingTop: theme.spacing.s,
          paddingBottom: theme.spacing.l,
        }}
      >
        <Pressable
          onPress={handleBack}
          style={{ padding: theme.spacing.s }}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={{ fontSize: 18 }}>←</Text>
        </Pressable>

        <Heading size="xl" style={{ flex: 1, textAlign: 'center' }}>
          About
        </Heading>

        <View style={{ width: 32 }} />{/* spacer */}
      </View>

      {/* Rows */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.m, paddingBottom: theme.spacing.xl }}>
        {ROWS.map((row) => (
          <Row key={row.id} icon={row.icon} label={row.label} onPress={() => router.push(row.to as any)} />
        ))}

        {/* Footer */}
        <View style={{ alignItems: 'center', marginTop: theme.spacing.xl }}>
          <Text style={{ color: theme.colors.text, fontSize: 14 }}>Version: 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
