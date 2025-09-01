// app/(app)/vault/tips.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../../lib/theme';
import BodyText from '../../../primitives/BodyText';
import Heading from '../../../primitives/Heading';

type Tip = { id: string; title: string; body: string; icon?: string };

const TIPS: Tip[] = [
  { id: 'vault', title: 'Vault', icon: '🗑️', body: `Vault clutter slows you down — delete what you don’t need.` },
  { id: 'feedback', title: 'Feedback', icon: '🔍', body: `Feedback is about structure, pacing, and tone — use it as guidance, not a grade.` },
  { id: 'reRecord', title: 'Re-Record', icon: '🎤', body: `Re-recording the same story is normal. Growth comes from repetition.` },
  { id: 'streaks', title: 'Streaks', icon: '🔥', body: `Your streak builds when you show up daily — record new stories or review and practice.` },
  { id: 'processing', title: 'Processing', icon: '⏳', body: `Feedback + Transcripts may take a moment. You’ll see a nice ✅ when ready.` },
  { id: 'transcripts', title: 'Transcripts', icon: '📖', body: `Small errors in transcripts are normal. Focus on feedback themes, not every word.` },
];

export default function VaultTips() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* Top App Bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.m,
          paddingTop: theme.spacing.s,
          paddingBottom: theme.spacing.m,
        }}
      >
        <Pressable onPress={() => router.push('/(app)/vault')} style={{ padding: theme.spacing.s }}>
          <Text style={{ fontSize: 18 }}>←</Text>
        </Pressable>
        <Heading size="xl" style={{ flex: 1, textAlign: 'center' }}>
          Vault Tips
        </Heading>
        <View style={{ width: 32 }} />
      </View>

      {/* Tips list */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.m,
          paddingBottom: theme.spacing.xl,
          gap: theme.spacing.m,
        }}
      >
        {TIPS.map(tip => (
          <View
            key={tip.id}
            accessible
            accessibilityRole="summary"
            style={{
              backgroundColor: theme.colors.bg,
              borderRadius: theme.radii.md,
              padding: theme.spacing.l,
              // no border color by request
              ...theme.shadows.cardSm,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.s }}>
              {tip.icon ? (
                <Text style={{ marginRight: theme.spacing.s, fontSize: 18 }}>{tip.icon}</Text>
              ) : null}
              <Heading size="m">{tip.title}</Heading>
            </View>
            <BodyText>{tip.body}</BodyText>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

