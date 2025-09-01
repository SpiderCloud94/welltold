import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  feedback?: {
    structure?: string;
    creative?: string;
  };
  transcript?: string;
  createdAt?: any;
  durationSec?: number;
  status: 'queued' | 'transcribing' | 'analyzing' | 'ready' | 'failed';
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const { active: hasEntitlement } = useEntitlement();

  const [story, setStory] = React.useState<StoryData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [sound, setSound] = React.useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [position, setPosition] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [feedbackExpanded, setFeedbackExpanded] = React.useState(false);
  const [transcriptExpanded, setTranscriptExpanded] = React.useState(false);

  React.useEffect(() => {
    if (id) {
      fetchStoryData();
    }
  }, [id]);

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const fetchStoryData = async () => {
    try {
      setLoading(true);
      // Placeholder: Replace with actual Firestore fetch
      // const doc = await getDoc(doc(firestore, `users/${uid}/vaultentry/${id}`));
      // if (doc.exists()) {
      //   setStory({ id: doc.id, ...doc.data() } as StoryData);
      // }
      
      // Mock data for development
      setStory({
        id: id!,
        title: 'Sample Story',
        recordingUrl: 'https://example.com/audio.mp3',
        feedback: {
          structure: 'Your story has a clear beginning, middle, and end. The narrative flows well and keeps the listener engaged.',
          creative: 'Great use of descriptive language! Consider adding more sensory details to make the story even more vivid.',
        },
        transcript: 'This is a sample transcript of the story content. It would contain the full text of what was spoken in the recording.',
        status: 'ready',
        durationSec: 120,
        createdAt: new Date('2024-01-15'),
      });
    } catch (error) {
      console.error('Error fetching story:', error);
      setStory({
        id: id!,
        title: 'Error Loading Story',
        status: 'failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAudio = async () => {
    if (!story?.recordingUrl) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: story.recordingUrl },
        { shouldPlay: false }
      );
      setSound(sound);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setDuration(status.durationMillis || 0);
          setIsPlaying(status.isPlaying || false);
        }
      });
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const togglePlayback = async () => {
    if (!sound) {
      await loadAudio();
      return;
    }

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const seekTo = async (positionMillis: number) => {
    if (sound) {
      await sound.setPositionAsync(positionMillis);
    }
  };

  const handleReRecord = () => {
    if (hasEntitlement) {
      router.push('/tell');
    } else {
      router.replace('/trial/paywall');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Story',
      'Delete this story permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Placeholder: Replace with actual Firestore + storage deletion
              // await deleteDoc(doc(firestore, `users/${uid}/vaultentry/${id}`));
              // await deleteObject(ref(storage, story.recordingUrl));
              router.replace('/');
            } catch (error) {
              console.error('Error deleting story:', error);
            }
          },
        },
      ]
    );
  };

  const getStatusChip = () => {
    if (!story || story.status === 'ready') return null;

    const statusText = {
      queued: 'Queued…',
      transcribing: 'Transcribing…',
      analyzing: 'Analyzing…',
      failed: 'Processing failed',
    }[story.status];

    return (
      <View style={{
        backgroundColor: story.status === 'failed' ? theme.colors.error : theme.colors.secondary,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radii.pill,
        alignSelf: 'flex-start',
        marginBottom: theme.spacing.m,
      }}>
        <Text style={{ color: theme.colors.bgAlt, fontSize: 14, fontWeight: '600' }}>
          {statusText}
        </Text>
      </View>
    );
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.bgAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...theme.shadows.cardSm,
                }}
              >
                <Text style={{ fontSize: 18, color: theme.colors.text }}>×</Text>
              </Pressable>
            </View>
          </View>
          <View
            style={{
              marginTop: theme.spacing.l,
              marginBottom: theme.spacing.m,
              paddingRight: theme.spacing.l,
            }}
          >
            <BodyText
              style={{
                textAlign: 'right',
                fontSize: 16,
                opacity: 0.8,
              }}
            >
              {formatDate(story?.createdAt)}
            </BodyText>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        >
          {/* Status Chip */}
          {getStatusChip()}

          {/* Failed Error Panel */}
          {isFailed && (
            <View style={{
              backgroundColor: theme.colors.error,
              borderRadius: theme.radii.md,
              padding: theme.spacing.l,
              marginBottom: theme.spacing.l,
            }}>
              <BodyText style={{ color: theme.colors.bgAlt, marginBottom: theme.spacing.m }}>
                We couldn't finish processing this story.
              </BodyText>
              <View style={{ flexDirection: 'row', gap: theme.spacing.m }}>
                <Button
                  title="Try Again"
                  variant="secondary"
                  onPress={fetchStoryData}
                />
                <Button
                  title="Back to Vault"
                  variant="secondary"
                  onPress={() => router.replace('/')}
                />
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
              <BodyText style={{ textAlign: 'center', color: theme.colors.text }}>
                Audio will appear when ready.
              </BodyText>
            ) : !story.recordingUrl ? (
              <BodyText style={{ textAlign: 'center', color: theme.colors.text }}>
                Audio not available.
              </BodyText>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m }}>
                {/* Play/Pause Button */}
                <Pressable
                  onPress={togglePlayback}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: theme.colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: theme.colors.bgAlt, fontSize: 20 }}>
                    {isPlaying ? '⏸' : '▶'}
                  </Text>
                </Pressable>

                {/* Scrubber and Time */}
                <View style={{ flex: 1 }}>
                  <View style={{
                    height: 4,
                    backgroundColor: theme.colors.divider,
                    borderRadius: 2,
                    marginBottom: theme.spacing.xs,
                  }}>
                    <View style={{
                      height: 4,
                      backgroundColor: theme.colors.primary,
                      borderRadius: 2,
                      width: duration > 0 ? `${(position / duration) * 100}%` : '0%',
                    }} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ ...theme.typography.caption, color: theme.colors.text }}>
                      {formatTime(position)}
                    </Text>
                    <Text style={{ ...theme.typography.caption, color: theme.colors.text }}>
                      {formatTime(duration)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Actions Row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: theme.spacing.m,
              marginTop: theme.spacing.m,
              marginBottom: theme.spacing.l,
            }}
          >
            <Pressable
              onPress={handleReRecord}
              testID="re-record-button"
              style={({ pressed }) => ({
                height: 52,
                borderRadius: theme.radii.pill,
                paddingHorizontal: theme.spacing.l,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.bgAlt,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 16 }}>
                Re-Record
              </Text>
            </Pressable>
            <Pressable
              onPress={handleDelete}
              testID="delete-button"
              style={({ pressed }) => ({
                height: 52,
                borderRadius: theme.radii.pill,
                paddingHorizontal: theme.spacing.l,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: theme.colors.btnBorder,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ color: theme.colors.error, fontWeight: '600', fontSize: 16 }}>
                Delete
              </Text>
            </Pressable>
          </View>

          {/* Feedback Accordion */}
          <View style={{ marginTop: theme.spacing.l, marginBottom: theme.spacing.m }}>
            <Accordion
              title="Feedback"
              expanded={feedbackExpanded}
              onToggle={() => setFeedbackExpanded(!feedbackExpanded)}
              testID="feedback-accordion"
            >
              {!isReady ? (
                <BodyText>Feedback not ready yet.</BodyText>
              ) : (
                <View style={{ gap: theme.spacing.l }}>
                  <View>
                    <Text style={{
                      ...theme.typography.body,
                      color: theme.colors.text,
                      fontWeight: '700',
                      marginBottom: theme.spacing.xs,
                    }}>
                      Structure Feedback
                    </Text>
                    <BodyText>{story.feedback?.structure || 'No structure feedback available.'}</BodyText>
                  </View>
                  <View>
                    <Text style={{
                      ...theme.typography.body,
                      color: theme.colors.text,
                      fontWeight: '700',
                      marginBottom: theme.spacing.xs,
                    }}>
                      Creative Notes
                    </Text>
                    <BodyText>{story.feedback?.creative || 'No creative notes available.'}</BodyText>
                  </View>
                </View>
              )}
            </Accordion>
          </View>

          {/* Transcript Accordion */}
          <Accordion
            title="Transcript"
            expanded={transcriptExpanded}
            onToggle={() => setTranscriptExpanded(!transcriptExpanded)}
            testID="transcript-accordion"
          >
            {!isReady ? (
              <BodyText>Transcript not ready yet.</BodyText>
            ) : (
              <BodyText>{story.transcript || 'No transcript available.'}</BodyText>
            )}
          </Accordion>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}