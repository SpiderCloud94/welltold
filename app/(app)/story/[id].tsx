// app/(app)/story/[id].tsx
import { useUser } from '@clerk/clerk-expo';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db } from '../../../lib/firebase';
import { theme } from '../../../lib/theme';
import Accordion from '../../../primitives/Accordion';
import BodyText from '../../../primitives/BodyText';
import Button from '../../../primitives/Button';
import Heading from '../../../primitives/Heading';
import { useEntitlement } from '../../../providers/EntitlementsProvider';

type StoryData = {
  id: string;
  title?: string;
  recordingUrl?: string;
  feedback?: { structure?: string; creative?: string } | string;
  transcript?: string;
  createdAt?: any;
  durationSec?: number;
  status: 'queued' | 'processing' | 'ready' | 'failed';
};

function formatDate(v: any) {
  try {
    if (v?.toDate) return v.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    if (typeof v?.seconds === 'number') return new Date(v.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const d = new Date(v); if (!isNaN(+d)) return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {}
  return '--';
}

export default function StoryDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const storyId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user, isLoaded, isSignedIn } = useUser();
  const { active: hasEntitlement } = useEntitlement();

  React.useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) router.replace('/(auth)/sign-in');
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) return null;

  if (!storyId) {
    router.replace('/');
    return null;
  }

  const [story, setStory] = React.useState<StoryData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [sound, setSound] = React.useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [position, setPosition] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [feedbackExpanded, setFeedbackExpanded] = React.useState(false);
  const [transcriptExpanded, setTranscriptExpanded] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);

  // Allow audio in iOS silent mode (tiny required setting)
  React.useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          // >>> added
          playThroughEarpieceAndroid: false,
          shouldDuckAndroid: true,
        });
      } catch {}
    })();
  }, []);

  React.useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || !storyId) return;
    const docRef = doc(db, 'users', user.id, 'vaultentry', String(storyId));
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();

          // normalize feedback
          let feedback: any = undefined;
          const rawFb = data.feedback;
          if (typeof rawFb === 'string') {
            try { feedback = JSON.parse(rawFb); } catch { feedback = rawFb; }
          } else if (rawFb && typeof rawFb === 'object') {
            feedback = rawFb;
          }

          // normalize transcript
          let transcript: string | undefined;
          const rawTx = data.transcript;
          if (typeof rawTx === 'string') {
            try {
              const parsed = JSON.parse(rawTx);
              transcript = typeof parsed === 'string' ? parsed : (parsed?.text ?? JSON.stringify(parsed));
            } catch {
              transcript = rawTx;
            }
          } else if (rawTx && typeof rawTx === 'object') {
            transcript = rawTx.text ?? JSON.stringify(rawTx);
          }

          setStory({
            id: snap.id,
            title: data.title || 'Untitled',
            recordingUrl: data.recordingUrl,
            feedback,
            transcript,
            status: data.status || 'queued',
            durationSec: data.durationSec,
            createdAt: data.createdAt,
          });
        } else {
          setStory({ id: storyId, title: 'Story Not Found', status: 'failed' } as StoryData);
        }
        setLoading(false);
      },
      () => {
        setStory({ id: storyId, title: 'Error Loading Story', status: 'failed' } as StoryData);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [isLoaded, isSignedIn, user, storyId, reloadKey]);

  React.useEffect(() => {
    return () => { if (sound) sound.unloadAsync().catch(() => {}); };
  }, [sound]);

  // --- playback helpers ---
  const loadAudio = async (): Promise<Audio.Sound | null> => {
    if (!story?.recordingUrl) return null;
    try {
      const { sound: s, status } = await Audio.Sound.createAsync(
        { uri: story.recordingUrl },
        { shouldPlay: false }
      );
      setSound(s);
      // >>> added
      await s.setIsMutedAsync(false);
      await s.setVolumeAsync(1.0);
      if ('isLoaded' in status && status.isLoaded) setDuration(status.durationMillis || 0);

      s.setOnPlaybackStatusUpdate((st) => {
        if ('isLoaded' in st && st.isLoaded) {
          setPosition(st.positionMillis || 0);
          setDuration(st.durationMillis || 0);
          setIsPlaying(!!st.isPlaying);
          // when it finishes, reset to start so it can be replayed immediately
          if ('didJustFinish' in st && st.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
            s.setPositionAsync(0).catch(() => {});
          }
        }
      });

      return s;
    } catch (e) {
      console.error('Error loading audio:', e);
      return null;
    }
  };

  const togglePlayback = async () => {
    let s = sound;
    if (!s) s = await loadAudio();
    if (!s) return;

    // If it's playing, restart from the beginning (auto "refresh")
    if (isPlaying) {
      try {
        await s.stopAsync();
      } catch {}
      await s.setPositionAsync(0);
      await s.playAsync();
      return;
    }

    // If not playing and we're at (or past) the end, start from 0
    if (duration > 0 && position >= Math.max(0, duration - 250)) {
      await s.playFromPositionAsync(0);
    } else {
      await s.playAsync();
    }
  };

  // Re-record always goes to Tell page (no paywall gate here)
  const handleReRecord = () => {
    router.push('/tell');
  };

  // Delete Firestore doc, then return to Vault
  const handleDelete = () => {
    Alert.alert('Delete Story', 'Delete this story permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const ref = doc(db, 'users', user!.id, 'vaultentry', String(storyId));
            await deleteDoc(ref);
          } catch (e) {
            console.error('Delete failed:', e);
          } finally {
            try { if (sound) { await sound.stopAsync(); await sound.unloadAsync(); } } catch {}
            router.replace('/');
          }
        },
      },
    ]);
  };

  const getStatusChip = () => {
    if (!story || story.status === 'ready') return null;
    const statusText = story.status === 'failed' ? 'Processing failed' : 'processing…';
    return (
      <View style={{
        backgroundColor: story.status === 'failed' ? theme.colors.error : theme.colors.secondary,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radii.pill,
        alignSelf: 'flex-start',
        marginBottom: theme.spacing.m,
      }}>
        <Text style={{ color: theme.colors.bgAlt, fontSize: 14, fontWeight: '600' }}>{statusText}</Text>
      </View>
    );
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  const rightTimeLabel =
    duration > 0
      ? formatTime(duration)
      : (story?.durationSec ? `${Math.floor(story.durationSec / 60)}:${String(story.durationSec % 60).padStart(2, '0')}` : '0:00');

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <BodyText>Loading story...</BodyText>
        </View>
      </SafeAreaView>
    );
  }

  if (!story) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <BodyText>Story not found</BodyText>
          <Button title="Back to Vault" onPress={() => router.replace('/')} />
        </View>
      </SafeAreaView>
    );
  }

  const isReady = story.status === 'ready';
  const isFailed = story.status === 'failed';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1, padding: theme.spacing.m }}>
        {/* Header */}
        <View style={{ marginBottom: theme.spacing.l }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }} />
            <Heading size="xl" testID="story-title" style={{ textAlign: 'center' }}>
              {story.title || 'Untitled'}
            </Heading>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Pressable
                onPress={() => router.replace('/')}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: theme.colors.bgAlt, alignItems: 'center', justifyContent: 'center',
                  ...theme.shadows.cardSm,
                }}
              >
                <Text style={{ fontSize: 18, color: theme.colors.text }}>×</Text>
              </Pressable>
            </View>
          </View>
          <View style={{ marginTop: theme.spacing.l, marginBottom: theme.spacing.m, paddingRight: theme.spacing.l }}>
            <BodyText style={{ textAlign: 'right', fontSize: 16, opacity: 0.8 }}>
              {formatDate(story.createdAt)}
            </BodyText>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: theme.spacing.xl }}>
          {/* Status Chip */}
          {getStatusChip()}

          {/* Failed Error Panel */}
          {isFailed && (
            <View style={{ backgroundColor: theme.colors.error, borderRadius: theme.radii.md, padding: theme.spacing.l, marginBottom: theme.spacing.l }}>
              <BodyText style={{ color: theme.colors.bgAlt, marginBottom: theme.spacing.m }}>
                We couldn't finish processing this story.
              </BodyText>
              <View style={{ flexDirection: 'row', gap: theme.spacing.m }}>
                <Button title="Try Again" variant="secondary" onPress={() => setReloadKey(k => k + 1)} />
                <Button title="Back to Vault" variant="secondary" onPress={() => router.replace('/')} />
              </View>
            </View>
          )}

          {/* Audio Player */}
          <View style={{
            backgroundColor: theme.colors.bgAlt,
            borderRadius: theme.radii.md,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.l,
            borderWidth: 1,
            borderColor: theme.colors.btnBorder,
            ...theme.shadows.cardSm,
          }}>
            {!isReady ? (
              <BodyText style={{ textAlign: 'center', color: theme.colors.text }}>Audio will appear when ready.</BodyText>
            ) : !story.recordingUrl ? (
              <BodyText style={{ textAlign: 'center', color: theme.colors.text }}>Audio not available.</BodyText>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m }}>
                <Pressable
                  onPress={togglePlayback}
                  style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: theme.colors.bgAlt, fontSize: 20 }}>{isPlaying ? '⏸' : '▶'}</Text>
                </Pressable>
                <View style={{ flex: 1 }}>
                  <View style={{ height: 4, backgroundColor: theme.colors.divider, borderRadius: 2, marginBottom: theme.spacing.xs }}>
                    <View style={{ height: 4, backgroundColor: theme.colors.primary, borderRadius: 2, width: duration > 0 ? `${(position / duration) * 100}%` : '0%' }} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ ...theme.typography.caption, color: theme.colors.text }}>
                      {formatTime(position)}
                    </Text>
                    <Text style={{ ...theme.typography.caption, color: theme.colors.text }}>
                      {rightTimeLabel}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Actions Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: theme.spacing.m, marginTop: theme.spacing.m, marginBottom: theme.spacing.l }}>
            <Pressable
              onPress={handleReRecord}
              testID="re-record-button"
              style={({ pressed }) => ({
                height: 52, borderRadius: theme.radii.pill, paddingHorizontal: theme.spacing.l,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: theme.colors.bgAlt, opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 16 }}>Re-Record</Text>
            </Pressable>
            <Pressable
              onPress={handleDelete}
              testID="delete-button"
              style={({ pressed }) => ({
                height: 52, borderRadius: theme.radii.pill, paddingHorizontal: theme.spacing.l,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.btnBorder, opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ color: theme.colors.error, fontWeight: '600', fontSize: 16 }}>Delete</Text>
            </Pressable>
          </View>

          {/* Feedback */}
          <View style={{ marginTop: theme.spacing.l, marginBottom: theme.spacing.m }}>
            <Accordion title="Feedback" expanded={feedbackExpanded} onToggle={() => setFeedbackExpanded(!feedbackExpanded)} testID="feedback-accordion">
              {story.status !== 'ready' ? (
                <BodyText>Feedback not ready yet.</BodyText>
              ) : typeof story.feedback === 'string' ? (
                <BodyText>{story.feedback || 'No feedback available.'}</BodyText>
              ) : (
                <View style={{ gap: theme.spacing.l }}>
                  <View>
                    <Text style={{ ...theme.typography.body, color: theme.colors.text, fontWeight: '700', marginBottom: theme.spacing.xs }}>Structure Feedback</Text>
                    <BodyText>{story.feedback?.structure || 'No structure feedback available.'}</BodyText>
                  </View>
                  <View>
                    <Text style={{ ...theme.typography.body, color: theme.colors.text, fontWeight: '700', marginBottom: theme.spacing.xs }}>Creative Notes</Text>
                    <BodyText>{story.feedback?.creative || 'No creative notes available.'}</BodyText>
                  </View>
                </View>
              )}
            </Accordion>
          </View>

          {/* Transcript */}
          <Accordion title="Transcript" expanded={transcriptExpanded} onToggle={() => setTranscriptExpanded(!transcriptExpanded)} testID="transcript-accordion">
            {story.status !== 'ready'
              ? <BodyText>Transcript not ready yet.</BodyText>
              : <BodyText>{story.transcript || 'No transcript available.'}</BodyText>}
          </Accordion>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}