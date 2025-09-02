// Context: Expo + expo-router; Firebase Auth/Firestore; Make.com webhooks; AsyncStorage.
// Guards: Use lib/theme.ts tokens only (no raw hex). Don’t persist onboarding answers.
// Public page — must not be gated. Auth gate only; entitlement handled later inside screens.

import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../lib/theme';
import Heading from '../../primitives/Heading';

export default function Agree() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* Fixed page that can scroll on very small screens */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: theme.spacing.l,
          paddingVertical: theme.spacing.xl,
          justifyContent: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <Text style={styles.checkIcon}>✅</Text>
            <Heading size="xl">Before You Start</Heading>
          </View>

          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Stories Are Yours</Text>
            <Text style={styles.sectionBody}>
              You own your recordings, transcripts, and notes. Content is private by default. We
              don’t sell it or use it to train AI. Delete stories anytime or your account in
              Settings (subject to store/device limits).
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Feedback</Text>
            <Text style={styles.sectionBody}>
              Automated AI analyzes structure, tone, pacing, and confidence. Feedback may contain
              errors or bias — treat as guidance, not professional advice. By continuing, you
              consent to AI processing of your recordings for feedback.
            </Text>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Microphone Access</Text>
            <Text style={styles.sectionBody}>
              The app needs access to your microphone so you can record stories. Recordings stay
              private to your account. You can revoke mic permissions anytime in your device
              settings.
            </Text>
          </View>

          {/* Footer buttons (inside card) */}
          <View style={styles.footerButtons}>
            <Pressable
              onPress={() => router.push('/(public)/about?from=onboarding')}
              style={styles.secondaryBtn}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryBtnText}>Learn More / Terms / Privacy</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(public)/thankyou')}
              style={styles.primaryBtn}
              accessibilityRole="button"
            >
              <Text style={styles.primaryBtnText}>Agree and Continue</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bg,
    borderRadius: theme.radii.md,
    padding: theme.spacing.xl,
    ...theme.shadows.cardMd,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.m,
    marginBottom: theme.spacing.xl,
  },
  checkIcon: {
    ...theme.typography.body,
  } as any,
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.titleM,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  } as any,
  sectionBody: {
    ...theme.typography.body,
    color: theme.colors.text,
  } as any,
  footerButtons: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.m,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: theme.colors.btnBorder,
    backgroundColor: theme.colors.bg,
    borderRadius: theme.radii.pill,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '700',
  } as any,
  primaryBtn: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.radii.pill,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    ...theme.typography.body,
    color: theme.colors.bg,
    fontWeight: '700',
  } as any,
});
