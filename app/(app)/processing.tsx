import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import React from 'react';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';

import { db } from '../../lib/firebase';
import { resolveUid } from '../../lib/runtime';
import { theme } from '../../lib/theme';
import BodyText from '../../primitives/BodyText';
import Button from '../../primitives/Button';
import Heading from '../../primitives/Heading';
import { useAuth } from '../../providers/AuthProvider';

type ProcessingStatus = 'queued' | 'transcribing' | 'analyzing' | 'ready' | 'failed';

type VaultEntry = {
  id: string;
  title: string;
  status: ProcessingStatus;
  transcript?: string;
  feedback?: any;
  recordingUrl?: string;
  createdAt?: any;
  updatedAt?: any;
};

export default function Processing() {
  const router = useRouter();
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const { user } = useAuth();
  
  const [status, setStatus] = React.useState<ProcessingStatus | null>(null);
  const [docExists, setDocExists] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [canKeepWaiting, setCanKeepWaiting] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  // Enable "Keep Waiting" after 60s
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCanKeepWaiting(true);
    }, 60000);
    return () => clearTimeout(timer);
  }, [retryCount]);

  React.useEffect(() => {
    const uid = resolveUid(user?.uid);
    
    // Auth check
    if (!uid) {
      setError('auth_required');
      return;
    }

    // StoryId check
    if (!storyId) {
      setError('missing_story_id');
      return;
    }

    // Clear any previous errors
    setError(null);
    setDocExists(false);
    setStatus(null);

    // Attach Firestore listener
    const docRef = doc(db, `users/${uid}/vaultentry/${storyId}`);
    
    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setDocExists(true);
          const data = doc.data() as VaultEntry;
          const currentStatus = data.status;
          setStatus(currentStatus);

          // Auto-route to story when ready
          if (currentStatus === 'ready') {
            router.replace(`/story/${storyId}`);
          }
        } else {
          setDocExists(false);
          setStatus(null);
        }
      },
      (error) => {
        console.error('Firestore listener error:', error);
        setError('listener_error');
      }
    );

    return () => unsubscribe();
  }, [user?.uid, storyId, retryCount]);

  const getStatusContent = () => {
    if (!docExists) {
      return {
        title: 'Setting things up…',
        subtitle: 'Preparing your story for processing.',
      };
    }

    switch (status) {
      case 'queued':
        return {
          title: 'Queued…',
          subtitle: "We'll start in a moment.",
        };
      case 'transcribing':
        return {
          title: 'Transcribing audio…',
          subtitle: 'Converting your voice to text.',
        };
      case 'analyzing':
        return {
          title: 'Generating feedback…',
          subtitle: 'Creating personalized insights.',
        };
      case 'failed':
        return {
          title: 'Processing failed',
          subtitle: 'Something went wrong. Please try again.',
        };
      default:
        return {
          title: 'Processing…',
          subtitle: 'Working on your story.',
        };
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setCanKeepWaiting(false);
    setError(null);
  };

  const handleBackToTell = () => {
    router.replace('/tell');
  };

  // Error states
  if (error === 'auth_required') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.l }}>
          <View style={{
            backgroundColor: theme.colors.bannerBg,
            borderRadius: theme.radii.md,
            padding: theme.spacing.l,
            marginBottom: theme.spacing.l,
            ...theme.shadows.cardSm,
          }}>
            <Heading size="m" style={{ textAlign: 'center', marginBottom: theme.spacing.m, color: theme.colors.bannerText }}>
              Authentication Required
            </Heading>
            <BodyText style={{ textAlign: 'center', color: theme.colors.bannerText }}>
              Please log in to continue processing your story.
            </BodyText>
          </View>
          <Button
            title="Back to Tell"
            variant="primary"
            onPress={handleBackToTell}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (error === 'missing_story_id') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.l }}>
          <View style={{
            backgroundColor: theme.colors.bannerBg,
            borderRadius: theme.radii.md,
            padding: theme.spacing.l,
            marginBottom: theme.spacing.l,
            ...theme.shadows.cardSm,
          }}>
            <Heading size="m" style={{ textAlign: 'center', marginBottom: theme.spacing.m, color: theme.colors.bannerText }}>
              Story Not Found
            </Heading>
            <BodyText style={{ textAlign: 'center', color: theme.colors.bannerText }}>
              No story ID was provided. Please start a new recording.
            </BodyText>
          </View>
          <Button
            title="Back to Tell"
            variant="primary"
            onPress={handleBackToTell}
          />
        </View>
      </SafeAreaView>
    );
  }

  const content = getStatusContent();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.l }}>
        
        {/* Main Content */}
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
          <ActivityIndicator 
            size="large" 
            color={theme.colors.primary}
            style={{ marginBottom: theme.spacing.l }}
          />
          <Heading size="xl" style={{ textAlign: 'center', marginBottom: theme.spacing.m }}>
            {content.title}
          </Heading>
          <BodyText style={{ textAlign: 'center', opacity: 0.7 }}>
            {content.subtitle}
          </BodyText>
        </View>

        {/* Failed Status Error Panel */}
        {status === 'failed' && (
          <View style={{
            backgroundColor: theme.colors.bannerBg,
            borderRadius: theme.radii.md,
            padding: theme.spacing.l,
            marginBottom: theme.spacing.l,
            width: '100%',
            ...theme.shadows.cardSm,
          }}>
            <BodyText style={{ textAlign: 'center', color: theme.colors.bannerText, marginBottom: theme.spacing.m }}>
              Processing failed. This might be due to audio quality or server issues.
            </BodyText>
            <View style={{ flexDirection: 'row', gap: theme.spacing.m, justifyContent: 'center' }}>
              <Button
                title="Retry"
                variant="primary"
                onPress={handleRetry}
              />
              <Button
                title="Back to Tell"
                variant="secondary"
                onPress={handleBackToTell}
              />
            </View>
          </View>
        )}

        {/* Listener Error Panel */}
        {error === 'listener_error' && (
          <View style={{
            backgroundColor: theme.colors.bannerBg,
            borderRadius: theme.radii.md,
            padding: theme.spacing.l,
            marginBottom: theme.spacing.l,
            width: '100%',
            ...theme.shadows.cardSm,
          }}>
            <BodyText style={{ textAlign: 'center', color: theme.colors.bannerText, marginBottom: theme.spacing.m }}>
              Connection error. Please check your internet connection.
            </BodyText>
            <View style={{ flexDirection: 'row', gap: theme.spacing.m, justifyContent: 'center' }}>
              <Button
                title="Retry"
                variant="primary"
                onPress={handleRetry}
              />
              <Button
                title="Back to Tell"
                variant="secondary"
                onPress={handleBackToTell}
              />
            </View>
          </View>
        )}

        {/* Footer Buttons */}
        {status !== 'failed' && !error && (
          <View style={{ 
            flexDirection: 'row', 
            gap: theme.spacing.m, 
            marginTop: 'auto',
            paddingBottom: theme.spacing.l
          }}>
            <Button
              title="Keep Waiting"
              variant="secondary"
              onPress={() => {}} // No-op, just for user comfort
              disabled={!canKeepWaiting}
            />
            <Button
              title="Back to Tell"
              variant="primary"
              onPress={handleBackToTell}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
