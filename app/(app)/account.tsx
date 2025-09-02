// app/(app)/account.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../lib/theme';
import BodyText from '../../primitives/BodyText';
import Heading from '../../primitives/Heading';

import { deleteUser, getAuth, signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../providers/AuthProvider'; // assumes it exposes { user }

// Android app-settings deep link helpers
let startAndroidSettings: (() => Promise<void>) | null = null;
let androidPackageId: string | null = null;
if (Platform.OS === 'android') {
  try {
    // Lazy import so iOS/web builds don’t complain
    // @ts-ignore
    const IntentLauncher = require('expo-intent-launcher');
    // @ts-ignore
    const Application = require('expo-application');
    startAndroidSettings = async () => {
      await IntentLauncher.startActivityAsync(
        'android.settings.APPLICATION_DETAILS_SETTINGS',
        { data: `package:${Application.applicationId}` }
      );
    };
    // @ts-ignore
    androidPackageId = require('expo-application').applicationId ?? null;
  } catch {
    startAndroidSettings = null;
  }
}

// --- Small shared Row component (same look as Settings rows)
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
        ...theme.shadows.cardSm,
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

export default function AccountScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const auth = getAuth();

  const [banner, setBanner] = React.useState<string | null>(null);
  const go = (to: Href) => router.push(to);

  // Guard: must be signed in
  React.useEffect(() => {
    if (!user) router.replace('/login' as const);
  }, [user]);

  const openChangeEmail = async () => {
    const current = user?.email ?? '';
    const subject = encodeURIComponent('Change Email Request – WellTold');
    const body = encodeURIComponent(
      `Hi WellTold team,\n\nI’d like to update my account email from ${current} to [new].\n\nThanks!`
    );
    const url = `mailto:welltoldhelp@outlook.com?subject=${subject}&body=${body}`;
    try {
      const ok = await Linking.canOpenURL(url);
      if (!ok) throw new Error('no mail client');
      await Linking.openURL(url);
    } catch {
      setBanner('No email app available. Please email welltoldhelp@outlook.com.');
    }
  };

  const openPermissions = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else if (Platform.OS === 'android' && startAndroidSettings) {
        await startAndroidSettings();
      } else {
        setBanner('Cannot open system settings on this platform.');
      }
    } catch {
      setBanner('Could not open system settings.');
    }
  };

  const openManageSubscription = async () => {
    try {
      if (Platform.OS === 'ios') {
        const native = 'itms-apps://apps.apple.com/account/subscriptions';
        const ok = await Linking.canOpenURL(native);
        if (ok) return Linking.openURL(native);
        // iOS has no reliable web fallback for subscriptions; show banner
        setBanner('Open App Store → Account → Subscriptions to manage.');
      } else if (Platform.OS === 'android') {
        const web = 'https://play.google.com/store/account/subscriptions';
        const native = 'https://play.google.com/store/account/subscriptions'; // web/native same here
        const ok = await Linking.canOpenURL(native);
        return Linking.openURL(ok ? native : web);
      } else {
        setBanner('Subscriptions management not available on this platform.');
      }
    } catch {
      setBanner('Could not open subscriptions.');
    }
  };

  const doLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.clear();
      router.replace('/login' as const);
    } catch {
      setBanner('Could not log out. Please try again.');
    }
  };

  async function deleteAllUserData(uid: string) {
    // delete stories in users/{uid}/vaultentry/*
    const col = collection(db, 'users', uid, 'vaultentry');
    const snap = await getDocs(col);
    const promises: Promise<void>[] = [];
    snap.forEach((d) => {
      promises.push(deleteDoc(doc(db, 'users', uid, 'vaultentry', d.id)));
    });
    await Promise.all(promises).catch(() => {
      // swallow individual failures; we’ll still attempt account delete
    });
  }

  const doDelete = async () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your stories. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user) return;
              setBanner(null);
              await deleteAllUserData(user.uid);
              // delete auth user (may require recent login in real life)
              if (auth.currentUser) {
                await deleteUser(auth.currentUser);
              }
              await AsyncStorage.clear();
              router.replace('/login' as const);
            } catch (e: any) {
              // Common: requires recent login
              setBanner('Could not delete account. You may need to log in again first.');
            }
          },
        },
      ]
    );
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
        <Pressable onPress={() => go('/(app)/settings' as const)} style={{ padding: theme.spacing.s }}>
          <Text style={{ fontSize: 18 }}>←</Text>
        </Pressable>
        <Heading size="xl" style={{ flex: 1, textAlign: 'center' }}>
          Account
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
      <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.m, paddingBottom: theme.spacing.xl }}>
        <Row icon="📧" title="Change Email" subtitle={user?.email ?? undefined} onPress={openChangeEmail} />
        <Row
          icon={Platform.OS === 'ios' ? '🎤' : '⚙️'}
          title="Permissions"
          subtitle={Platform.OS === 'android' && androidPackageId ? `App: ${androidPackageId}` : undefined}
          onPress={openPermissions}
        />
        <Row icon="💲" title="Manage Subscription" onPress={openManageSubscription} />
        <Row icon="↩️" title="Logout" onPress={doLogout} />
        <Row icon="🗑️" title="Delete Account" onPress={doDelete} />
      </ScrollView>
    </SafeAreaView>
  );
}

