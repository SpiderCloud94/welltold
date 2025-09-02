// Context: Expo + expo-router; Firebase Auth/Firestore (reads only later); styling via lib/theme.ts.
// Guards: No raw hex; public page; do NOT persist answers (local-only).

import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../../lib/theme';
import Heading from '../../../primitives/Heading';

const OPTIONS = [
  'Dating / Relationships',
  'Work / Career',
  'Friends & Social settings',
  'Online (TikTok, Podcast, YouTube)',
  'Other',
];

export default function Question2() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  // bigPad uses xxl if present, else 2x xl (same as Q1)
  const SP = theme.spacing as any;
  const bigPad: number = SP.xxl ?? theme.spacing.xl * 2;

  const canContinue = selectedIndex !== null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.l,
          paddingTop: theme.spacing.l,
          paddingBottom: 160, // room for pinned footer
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with larger bottom padding (same pattern as agreed) */}
        <View style={{ paddingTop: bigPad, paddingBottom: bigPad * 2.5 }}>
          <Heading size="xl" style={{ textAlign: 'left' }}>
            What situations do you want to improve at telling stories?
          </Heading>
        </View>

        {/* Options */}
        <View style={{ gap: theme.spacing.m }}>
          {OPTIONS.map((label, i) => {
            const selected = selectedIndex === i;
            return (
              <Pressable
                key={i}
                onPress={() => setSelectedIndex(i)}
                style={[
                  styles.option,
                  {
                    backgroundColor: selected
                      ? theme.colors.optionActive
                      : theme.colors.optionInactive,
                    borderColor: theme.colors.btnBorder,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={styles.optionText}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Pinned footer */}
      <SafeAreaView
        edges={['bottom']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: theme.spacing.l,
          paddingTop: theme.spacing.m,
          paddingBottom: theme.spacing.l,
          backgroundColor: theme.colors.bg,
        }}
      >
        <Pressable
          disabled={!canContinue}
          onPress={() => router.push('/(public)/onboarding/question3')}
          style={[
            styles.cta,
            {
              backgroundColor: theme.colors.text, // dark pill from tokens
              opacity: canContinue ? 1 : 0.45,    // disabled look (no raw hex)
            },
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue }}
        >
          <Text style={styles.ctaText}>Continue</Text>
        </Pressable>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  option: {
    height: 60, // h60
    borderRadius: theme.radii.md, // r12
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.l,
  },
  optionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  } as any,
  cta: {
    height: 56,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.cardSm,
  },
  ctaText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.bg,
  } as any,
});

