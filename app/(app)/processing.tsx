// app/(app)/processing.tsx
import { useUser } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db } from '../../lib/firebase';
import { theme } from '../../lib/theme';
import BodyText from '../../primitives/BodyText';
import Button from '../../primitives/Button';
import Heading from '../../primitives/Heading';

type ProcessingStatus = 'queued' | 'transcribing' | 'analyzing' | 'ready' | 'failed';

type VaultEntry = {
  id: string;
  title: string;
  status: ProcessingStatus;
  transcript?: string;
  feedback?: unknown;
  recordingUrl?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export default function Processing() {
  const router = useRouter();
  const { storyId } = useLocalSearchParams<{ storyId?: string }>();
  const { user, isLoaded, isSignedIn } = useUser();

  React.useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) router.replace('/(auth)/sign-in');
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) return null;

  const uid = user!.id;

  const [status, setStatus] = React.useState<ProcessingStatus | null>(null);
  const [docExists, setDocExists] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [canKeepWaiting, setCanKeepWaiting] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setCanKeepWaiting(true), 60_000);
    return () => clearTimeout(timer);
  }, [retryCount]);

  React.useEffect(() => {
    if (!storyId) { setError('missing_story_id'); return; }
    if (!uid)     { setError('auth_required');     return; }

    setError(null);
    setDocExists(false);
    setStatus(null);

    const ref = doc(db, `users/${uid}/vaultentry/${storyId}`);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setDocExists(false);
          setStatus(null);
          return;
        }
        setDocExists(true);
        const data = snap.data() as VaultEntry;
        const current = data.status;
        setStatus(current);
        if (current === 'ready') {
          router.replace({ pathname: '/story/[id]', params: { id: String(storyId) } });
        }
      },
      () => setError('listener_error')
    );

    return () => unsubscribe();
  }, [uid, storyId, retryCount, router]);

  const getStatusContent = () => {
    if (!docExists) return { title: 'Setting things up…', subtitle: 'Preparing your story for processing.' as const };
    switch (status) {
      case 'queued':        return { title: 'Queued…',             subtitle: "We'll start in a moment." as const };
      case 'transcribing':  return { title: 'Transcribing audio…',  subtitle: 'Converting your voice to text.' as const };
      case 'analyzing':     return { title: 'Generating feedback…', subtitle: 'Creating personalized insights.' as const };
      case 'failed':        return { title: 'Processing failed',    subtitle: 'Something went wrong. Please try again.' as const };
      default:              return { title: 'Processing…',          subtitle: 'Working on your story.' as const };
    }
  };

  const handleRetry = () => {
    setRetryCount((n) => n + 1);
    setCanKeepWaiting(false);
    setError(null);
  };

  const handleBackToTell = () => router.replace('/tell');

  if (error === 'auth_required') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.l }}>
          <View style={{ backgroundColor: theme.colors.bannerBg, borderRadius: theme.radii.md, padding: theme.spacing.l, marginBottom: theme.spacing.l, ...theme.shadows.cardSm }}>
            <Heading size="m" style={{ textAlign: 'center', marginBottom: theme.spacing.m, color: theme.colors.bannerText }}>
              Authentication Required
            </Heading>
            <BodyText style={{ textAlign: 'center', color: theme.colors.bannerText }}>
              Please log in to continue processing your story.
            </BodyText>
          </View>
          <Button title="Back to Tell" variant="primary" onPress={handleBackToTell} />
        </View>
      </SafeAreaView>
    );
  }

  if (error === 'missing_story_id') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.l }}>
          <View style={{ backgroundColor: theme.colors.bannerBg, borderRadius: theme.radii.md, padding: theme.spacing.l, marginBottom: theme.spacing.l, ...theme.shadows.cardSm }}>
            <Heading size="m" style={{ textAlign: 'center', marginBottom: theme.spacing.m, color: theme.colors.bannerText }}>
              Story Not Found
            </Heading>
            <BodyText style={{ textAlign: 'center', color: theme.colors.bannerText }}>
              No story ID was provided. Please start a new recording.
            </BodyText>
          </View>
          <Button title="Back to Tell" variant="primary" onPress={handleBackToTell} />
        </View>
      </SafeAreaView>
    );
  }

  const content = getStatusContent();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.l }}>
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginBottom: theme.spacing.l }} />
          <Heading size="xl" style={{ textAlign: 'center', marginBottom: theme.spacing.m }}>
            {content.title}
          </Heading>
          <BodyText style={{ textAlign: 'center', opacity: 0.7 }}>
            {content.subtitle}
          </BodyText>
        </View>

        {status === 'failed' && (
          <View
            style={{
              backgroundColor: theme.colors.bannerBg,
              borderRadius: theme.radii.md,
              padding: theme.spacing.l,
              marginBottom: theme.spacing.l,
              width: '100%',
              ...theme.shadows.cardSm,
            }}
          >
            <BodyText style={{ textAlign: 'center', color: theme.colors.bannerText, marginBottom: theme.spacing.m }}>
              Processing failed. This might be due to audio quality or server issues.
            </BodyText>
            <View style={{ flexDirection: 'row', gap: theme.spacing.m, justifyContent: 'center' }}>
              <Button title="Retry" variant="primary" onPress={handleRetry} />
              <Button title="Back to Tell" variant="secondary" onPress={handleBackToTell} />
            </View>
          </View>
        )}

        {error === 'listener_error' && (
          <View
            style={{
              backgroundColor: theme.colors.bannerBg,
              borderRadius: theme.radii.md,
              padding: theme.spacing.l,
              marginBottom: theme.spacing.l,
              width: '100%',
              ...theme.shadows.cardSm,
            }}
          >
            <BodyText style={{ textAlign: 'center', color: theme.colors.bannerText, marginBottom: theme.spacing.m }}>
              Connection error. Please check your internet connection.
            </BodyText>
            <View style={{ flexDirection: 'row', gap: theme.spacing.m, justifyContent: 'center' }}>
              <Button title="Retry" variant="primary" onPress={handleRetry} />
              <Button title="Back to Tell" variant="secondary" onPress={handleBackToTell} />
            </View>
          </View>
        )}

        {status !== 'failed' && !error && (
          <View style={{ flexDirection: 'row', gap: theme.spacing.m, marginTop: 'auto', paddingBottom: theme.spacing.l }}>
            <Button title="Keep Waiting" variant="secondary" onPress={() => {}} disabled={!canKeepWaiting} />
            <Button title="Back to Tell" variant="primary" onPress={handleBackToTell} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}