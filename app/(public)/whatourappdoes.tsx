// app/(public)/whatourappdoes.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../lib/theme';
import BodyText from '../../primitives/BodyText';
import Heading from '../../primitives/Heading';

type Feature = { id: string; title: string; body: string; icon?: string };

const FEATURES: Feature[] = [
  {
    id: 'vault',
    title: 'Story Vault',
    icon: '🏛️',
    body: `Save all your stories in one place. Record, revisit, and refine whenever you want.`,
  },
  {
    id: 'structure',
    title: 'Structure Feedback',
    icon: '⚡',
    body: `AI highlights how your story flows, where it’s clear, where it drifts, and how to tighten it up.`,
  },
  {
    id: 'tone',
    title: 'Tone & Pacing Feedback',
    icon: '🎙️',
    body: `Get tips on energy, pauses, and rhythm so your delivery feels natural and confident.`,
  },
  {
    id: 'confidence',
    title: 'Confidence Cues',
    icon: '👍',
    body: `Encouragement and micro feedback to help you sound more assured and engaging.`,
  },
  {
    id: 'ritual',
    title: 'Ready Ritual',
    icon: '🎯',
    body: `Quick warm-ups and tips before recording to shake off nerves and focus on delivery.`,
  },
];

export default function WhatOurAppDoes() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();

  const backTarget =
    from ? (`/(public)/about?from=${encodeURIComponent(from)}` as const) : ('/(public)/about' as const);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* Top App Bar (public page → no bottom tabs here) */}
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
          onPress={() => router.push(backTarget)}
          style={{ padding: theme.spacing.s }}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={{ fontSize: 18 }}>←</Text>
        </Pressable>

        <Heading size="xl" style={{ flex: 1, textAlign: 'center' }}>
          What Our App Does
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
        {FEATURES.map((f) => (
          <View
            key={f.id}
            style={{
              backgroundColor: theme.colors.bg,
              borderRadius: theme.radii.md,
              padding: theme.spacing.l,
              marginBottom: theme.spacing.m,
              // no border
              ...theme.shadows.cardSm,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.s }}>
              {f.icon ? (
                <Text style={{ marginRight: theme.spacing.s, fontSize: 18 }}>{f.icon}</Text>
              ) : null}
              <Heading size="m">{f.title}</Heading>
            </View>
            <BodyText>{f.body}</BodyText>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

