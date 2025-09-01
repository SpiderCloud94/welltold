// app/(app)/readyritual.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../lib/theme';
import BodyText from '../../primitives/BodyText';
import Heading from '../../primitives/Heading';

type Ritual = { id: string; title: string; body: string; icon?: string };

const RITUALS: Ritual[] = [
  { id: 'settle',    title: 'Settle In',       icon: '😌', body: `Take one slow breath before you start. Confidence begins with calm.` },
  { id: 'context',   title: 'Context Box',     icon: '🧠', body: `Use the context box to guide your feedback — note the story type, tone, or goal.` },
  { id: 'recording', title: 'Recording',       icon: '🎙️', body: `This is practice, not performance. Don't chase perfection on the first try.` },
  { id: 'repeat',    title: 'Repeat',          icon: '🔁', body: `Re-recording is part of the process. Each one makes your delivery stronger.` },
  { id: 'yourrec',   title: 'Your Recordings', icon: '📁', body: `Every take is saved in your Vault. You can review, compare, or delete anytime.` },
  { id: 'pauses',    title: 'Use Pauses',      icon: '⏸️', body: `A short pause is powerful. It gives your story room to land.` },
  { id: 'progress',  title: 'Progress',        icon: '🌱', body: `One story at a time. Show up, practice, and let the Vault track your progress.` },
];

export default function ReadyRitual() {
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
        <Pressable
          onPress={() => router.push('/(app)/tell')}
          style={{ padding: theme.spacing.s }}
          accessibilityRole="button"
          accessibilityLabel="Back to Tell"
        >
          <Text style={{ fontSize: 18 }}>←</Text>
        </Pressable>

        <Heading size="xl" style={{ flex: 1, textAlign: 'center' }}>
          Ready Ritual
        </Heading>

        {/* spacer for symmetry */}
        <View style={{ width: 32 }} />
      </View>

      {/* Cards */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.m,
          paddingBottom: theme.spacing.xl,
        }}
      >
        {RITUALS.map((tip) => (
          <View
            key={tip.id}
            style={{
              backgroundColor: theme.colors.bg,
              borderRadius: theme.radii.md,
              padding: theme.spacing.l,
              marginBottom: theme.spacing.m,
              ...theme.shadows.cardSm,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: theme.spacing.s,
              }}
            >
              {tip.icon ? (
                <Text style={{ marginRight: theme.spacing.s, fontSize: 18 }}>
                  {tip.icon}
                </Text>
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


