// app/tell.tsx
// DEV ONLY: allow Tell without entitlement (flip to false before shipping)
const BUILD_ALLOW_TELL = true;

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUser } from '@clerk/clerk-expo';
import { validateAudioFile } from '../../lib/config';
import { uploadToMake } from '../../lib/make';
import { startRecording, stopRecordingGetFile } from '../../lib/recording';
import { theme } from '../../lib/theme';
import BodyText from '../../primitives/BodyText';
import Button from '../../primitives/Button';
import Heading from '../../primitives/Heading';
import { useEntitlement } from '../../providers/EntitlementsProvider';

// duration fix (unchanged)
import { Audio } from 'expo-av';
// zero-byte guard
import * as FileSystem from 'expo-file-system';

// Firestore (client) – used only to create the shell doc
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

type RecordingState = 'idle' | 'recording' | 'review';

function createStoryId(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `${t}-${r}`;
}

async function getOrCreateDeviceId(): Promise<string> {
  const KEY = 'wt.deviceId';
  let id = await AsyncStorage.getItem(KEY);
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(KEY, id);
  }
  return id;
}

export default function Tell() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  if (!isSignedIn) { router.replace('/(auth)/sign-in'); return null; }
  const { active: hasAccess } = useEntitlement();

  const [context, setContext] = React.useState('');
  const [recordingState, setRecordingState] = React.useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [audioUri, setAudioUri] = React.useState<string | null>(null);
  const [audioDuration, setAudioDuration] = React.useState(0);
  const [reviewTitle, setReviewTitle] = React.useState('Untitled Story');
  const [uploading, setUploading] = React.useState(false);
  const [permissionDenied, setPermissionDenied] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const canUsePaid = BUILD_ALLOW_TELL || hasAccess;

  // ---- minimal change: correct timer typing
  React.useEffect(() => {
    let timerId: ReturnType<typeof setInterval> | null = null;
    if (recordingState === 'recording') {
      timerId = setInterval(() => { setRecordingTime((p) => p + 1); }, 1000);
    }
    return () => { if (timerId !== null) clearInterval(timerId); };
  }, [recordingState]);

  // ---- load saved context on mount (unchanged)
  React.useEffect(() => { loadSavedContext(); }, []);

  const loadSavedContext = async () => {
    try { const saved = await AsyncStorage.getItem('pendingContext'); if (saved) setContext(saved); }
    catch (e) { console.error('Failed to load context:', e); }
  };

  const clearSavedContext = async () => {
    try { await AsyncStorage.removeItem('pendingContext'); }
    catch (e) { console.error('Failed to clear context:', e); }
  };

  // ---- minimal addition: tiny debounce so we don't spam writes
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleContextChange = (value: string) => {
    setContext(value);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      AsyncStorage.setItem('pendingContext', value).catch(() => {});
    }, 500);
  };

  function withAccess(action: () => void) {
    if (canUsePaid) action(); else router.replace('/trial/paywall');
  }

  const handleMicPress = async () => {
    if (recordingState === 'idle') {
      try {
        setPermissionDenied(false);
        await startRecording();
        setRecordingState('recording');
        setRecordingTime(0);
      } catch (error) {
        console.error('Recording failed:', error);
        if (error instanceof Error && error.message.includes('Permission')) setPermissionDenied(true);
      }
    } else if (recordingState === 'recording') {
      try {
        const result = await stopRecordingGetFile();
        setAudioUri(result.uri);

        // duration read (unchanged)
        try {
          const { sound, status } = await Audio.Sound.createAsync(
            { uri: result.uri },
            { shouldPlay: false }
          );
          const durMs = ('durationMillis' in status && status.durationMillis) ? status.durationMillis : 0;
          const durSec = Math.max(0, Math.round(durMs / 1000));
          setAudioDuration(durSec);
          await sound.unloadAsync();
        } catch {
          setAudioDuration(result.duration || 0);
        }

        setRecordingState('review');
        setRecordingTime(0);
      } catch (error) {
        console.error('Stop recording failed:', error);
        setRecordingState('idle');
      }
    }
  };

  const handleSave = async () => {
    if (!audioUri) return;

    setUploading(true);
    setUploadError(null);

    try {
      // zero-byte guard
      const info = await FileSystem.getInfoAsync(audioUri);
      if (!info.exists || (info.size ?? 0) === 0) {
        setUploadError('Recording failed. File is empty.');
        setRecordingState('idle');
        return;
      }

      // Validate audio
      const validation = validateAudioFile(audioUri, audioDuration);
      if (!validation.valid) {
        setUploadError(validation.error || 'Invalid audio file');
        return;
      }

      const uid = user?.id;
      if (!uid) { router.replace('/(auth)/sign-in'); return; }

      const storyId = createStoryId();
      await setDoc(
        doc(db, 'users', uid, 'vaultentry', storyId),
        {
          title: reviewTitle || 'Untitled Story',
          status: 'queued',
          durationSec: audioDuration || 0,
          contextbox: context || '',
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      const form = new FormData();
      form.append('userId', uid);
      form.append('storyId', storyId);
      form.append('title', reviewTitle || 'Untitled Story');
      form.append('durationSec', String(audioDuration || 0));
      form.append('contextbox', context || '');
      form.append('clientId', String(Date.now()));
      form.append('createdAtISO', new Date().toISOString());

      const deviceId = await getOrCreateDeviceId();
      form.append('deviceId', deviceId);

      // explicit filename + mimeType
      form.append('filename', 'story.m4a');
      form.append('mimeType', 'audio/m4a');

      // RN file part
      // @ts-expect-error react-native FormData file
      form.append('file', { uri: audioUri, name: 'story.m4a', type: 'audio/m4a' });

      await uploadToMake(form);

      await clearSavedContext();
      router.replace(`/story/${storyId}`);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    setAudioUri(null);
    setAudioDuration(0);
    setRecordingState('idle');
    setReviewTitle('Untitled Story');
    setUploadError(null);
  };

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const getMicButtonLabel = () =>
    (recordingState === 'idle' ? 'Tap to Record'
      : recordingState === 'recording' ? 'Tap to Stop'
      : 'Recording Complete');
  const tryAgainPermission = () => { setPermissionDenied(false); withAccess(handleMicPress); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.m, paddingBottom: theme.spacing.xl }}>
        <Heading size="xl" style={{ textAlign: 'center', marginBottom: theme.spacing.xl }}>
          Ready to tell your story?
        </Heading>

        {/* Context Input */}
        <View style={{ marginBottom: theme.spacing.m }}>
          <TextInput
            value={context}
            onChangeText={handleContextChange}
            placeholder="What's your story? Paint a quick picture for context 👀"
            multiline
            style={{
              backgroundColor: theme.colors.bgAlt,
              borderRadius: theme.radii.md,
              padding: theme.spacing.l,
              borderWidth: 1,
              borderColor: theme.colors.btnBorder,
              ...theme.shadows.cardSm,
              minHeight: 120,
              ...theme.typography.body,
              color: theme.colors.text,
            }}
            placeholderTextColor={`${theme.colors.text}80`}
          />
          <BodyText style={{ marginTop: theme.spacing.xs, opacity: 0.7 }}>
            Used to improve feedback. Saved locally until you record.
          </BodyText>
        </View>

        {/* Permission Denied Panel */}
        {permissionDenied && (
          <View style={{ backgroundColor: theme.colors.error, borderRadius: theme.radii.md, padding: theme.spacing.l, marginBottom: theme.spacing.l }}>
            <BodyText style={{ color: theme.colors.bgAlt, marginBottom: theme.spacing.m }}>
              Microphone access is required to record your story.
            </BodyText>
            <View style={{ flexDirection: 'row', gap: theme.spacing.m }}>
              <Button title="Open Settings" variant="secondary" onPress={() => Alert.alert('Open Settings', 'Please enable microphone access in your device settings.')} />
              <Button title="Try Again" variant="secondary" onPress={tryAgainPermission} />
            </View>
          </View>
        )}

        {/* Recording Control */}
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
          <Pressable
            onPress={() => withAccess(handleMicPress)}
            disabled={recordingState === 'review'}
            style={({ pressed }) => ({
              width: 120, height: 120, borderRadius: 60,
              backgroundColor: recordingState === 'recording' ? theme.colors.error : theme.colors.primary,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: theme.spacing.m, opacity: pressed ? 0.9 : 1, ...theme.shadows.cardMd,
            })}
          >
            <Text style={{ fontSize: 48, color: theme.colors.bgAlt }}>{recordingState === 'recording' ? '⏹' : '🎤'}</Text>
          </Pressable>
          <BodyText style={{ textAlign: 'center', marginBottom: theme.spacing.xs }}>{getMicButtonLabel()}</BodyText>
          <Text style={[{ fontSize: 20, fontWeight: '600' as const, lineHeight: 26 }, { color: theme.colors.text }]}>{formatTime(recordingTime)}</Text>
        </View>

        {/* Ready Ritual Link */}
        <Pressable onPress={() => router.push('/readyritual')} style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
          <View style={{ backgroundColor: theme.colors.bgAlt, borderRadius: theme.radii.md, padding: theme.spacing.l, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.btnBorder, ...theme.shadows.cardSm }}>
            <Text style={{ fontSize: 24, marginBottom: theme.spacing.xs }}>📖</Text>
            <BodyText style={{ fontWeight: '600' }}>Ready Ritual</BodyText>
          </View>
        </Pressable>
      </ScrollView>

      {/* Review Dialog */}
      <Modal visible={recordingState === 'review'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
          <View style={{ flex: 1, padding: theme.spacing.l }}>
            <Heading size="m" style={{ textAlign: 'center', marginBottom: theme.spacing.l }}>Review Your Story</Heading>

            <View style={{ marginBottom: theme.spacing.l }}>
              <BodyText style={{ marginBottom: theme.spacing.xs, fontWeight: '600' }}>Title</BodyText>
              <TextInput
                value={reviewTitle}
                onChangeText={setReviewTitle}
                style={{
                  backgroundColor: theme.colors.bgAlt,
                  borderRadius: theme.radii.md,
                  padding: theme.spacing.l,
                  borderWidth: 1, borderColor: theme.colors.btnBorder,
                  ...theme.typography.body, color: theme.colors.text,
                }}
                placeholderTextColor={`${theme.colors.text}80`}
              />
            </View>

            {uploadError && (
              <View style={{ backgroundColor: theme.colors.error, borderRadius: theme.radii.md, padding: theme.spacing.m, marginBottom: theme.spacing.l }}>
                <BodyText style={{ color: theme.colors.bgAlt }}>{uploadError}</BodyText>
              </View>
            )}

            <View style={{ flexDirection:'row', justifyContent:'center', gap: theme.spacing.m, marginTop: theme.spacing.m }}>
              <Button variant="secondary" title="Re-Record" onPress={() => withAccess(handleDelete)} />
              <Button variant="primary" title={uploading ? 'Saving...' : 'Save'} onPress={() => withAccess(handleSave)} disabled={uploading || (!BUILD_ALLOW_TELL && !hasAccess)} />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}