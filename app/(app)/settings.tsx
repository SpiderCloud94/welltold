// app/(app)/settings.tsx
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { Alert, Linking, Platform, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUser } from '@clerk/clerk-expo';
import { theme } from '../../lib/theme';
import BodyText from '../../primitives/BodyText';
import Heading from '../../primitives/Heading';

// TODO: set your real IDs before release
const APP_STORE_ID = '0000000000';      // e.g. 1234567890
const ANDROID_PACKAGE = 'com.yourapp';  // e.g. com.welltold.app

function Row({
  icon,
  title,
  subtitle,
  onPress,
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
        ...theme.shadows.cardSm, // ✅ subtle shadow, no borders
      }}
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

export default function SettingsScreen() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  if (!isSignedIn) { router.replace('/(auth)/sign-in'); return null; }

  const go = (to: Href) => router.push(to);

  const requireAuth = (to: Href) => {
    if (!user) return router.push('/login' as const);
    router.push(to);
  };

  const openStore = async () => {
    try {
      if (Platform.OS === 'ios') {
        const url = `itms-apps://itunes.apple.com/app/id${APP_STORE_ID}`;
        const ok = await Linking.canOpenURL(url);
        return Linking.openURL(ok ? url : `https://apps.apple.com/app/id${APP_STORE_ID}`);
      }
      if (Platform.OS === 'android') {
        const url = `market://details?id=${ANDROID_PACKAGE}`;
        const ok = await Linking.canOpenURL(url);
        return Linking.openURL(ok ? url : `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`);
      }
      return Linking.openURL(`https://apps.apple.com/app/id${APP_STORE_ID}`);
    } catch {
      Alert.alert('Could not open the store right now.');
    }
  };

  const inviteFriends = async () => {
    try {
      await Share.share({
        message: 'Check out WellTold — tell better stories! Download here: https://welltold.app',
      });
    } catch {
      // cancelled
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* Header */}
      <View
  style={{
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl, // 👈 more space below header
  }}
>
  <Heading size="xl" style={{ textAlign: 'center' }}>Settings</Heading>
</View>


      {/* Rows */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.m, paddingBottom: theme.spacing.xl }}>
        <Row
          icon="⭐"
          title="Upgrade"
          onPress={() => go('/(app)/upgrade' as const)}
        />
        <Row
          icon="👤"
          title="Account"
          onPress={() => requireAuth('/(app)/account' as const)}
        />
        <Row
          icon="❤️"
          title="Rate our App"
          onPress={openStore}
        />
        <Row
          icon="📤"
          title="Invite Friends"
          onPress={inviteFriends}
        />
        <Row
          icon="📨"
          title="Help & Feedback"
          onPress={() => requireAuth('/(app)/help' as const)}
        />
        <Row
          icon="ℹ️"
          title="About"
          onPress={() => go('/(public)/about' as const)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

