// app/(app)/help.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../lib/theme';
import BodyText from '../../primitives/BodyText';
import Heading from '../../primitives/Heading';

const SUPPORT_EMAIL = 'welltoldhelp@outlook.com';

function Row({
  icon,
  title,
  onPress,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.colors.bg,
        borderRadius: theme.radii.md,
        padding: theme.spacing.l,
        marginBottom: theme.spacing.m,
        ...theme.shadows.cardSm, // same look as Settings rows
      }}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, marginRight: theme.spacing.s }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Heading size="m">{title}</Heading>
          {subtitle ? <BodyText>{subtitle}</BodyText> : null}
        </View>
        <Text style={{ fontSize: 18, marginLeft: theme.spacing.s }}>›</Text>
      </View>
    </Pressable>
  );
}

export default function HelpAndFeedback() {
  const router = useRouter();
  const [banner, setBanner] = React.useState<string | null>(null);

  const openMail = async (subject: string) => {
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
    try {
      const ok = await Linking.canOpenURL(mailto);
      if (!ok) throw new Error('no-mail');
      await Linking.openURL(mailto);
    } catch {
      setBanner(
        `Couldn't open email client. Please contact us at ${SUPPORT_EMAIL}.`
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* Header */}
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
          onPress={() => router.push('/(app)/settings' as const)}
          style={{ padding: theme.spacing.s }}
          accessibilityRole="button"
          accessibilityLabel="Back to Settings"
        >
          <Text style={{ fontSize: 18 }}>←</Text>
        </Pressable>

        <Heading size="xl" style={{ flex: 1, textAlign: 'center' }}>
          Help and Feedback
        </Heading>

        <View style={{ width: 32 }} />
      </View>

      {/* Inline banner */}
      {banner ? (
        <View
          style={{
            marginHorizontal: theme.spacing.m,
            marginBottom: theme.spacing.m,
            backgroundColor: theme.colors.bannerBg,
            borderRadius: theme.radii.md,
            padding: theme.spacing.m,
          }}
        >
          <BodyText style={{ color: theme.colors.bannerText }}>{banner}</BodyText>
        </View>
      ) : null}

      {/* Rows */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.m,
          paddingBottom: theme.spacing.xl,
        }}
      >
        <Row
          icon="💳"
          title="Billing / Subscription Questions"
          onPress={() => openMail('Billing / Subscription Question')}
        />
        <Row
          icon="👤"
          title="Account Help"
          onPress={() => openMail('Account Help')}
        />
        <Row
          icon="🐞"
          title="Report a Bug"
          onPress={() => openMail('Bug Report')}
        />
        <Row
          icon="✨"
          title="Request a Feature"
          onPress={() => openMail('Feature Request')}
        />
        <Row
          icon="✉️"
          title="General Feedback"
          onPress={() => openMail('General Feedback')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

