// DEV ONLY: allow Tell without entitlement (flip to false before shipping)
const BUILD_ALLOW_TELL = true;

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { validateAudioFile } from '../../lib/config';
import { getDeviceId } from '../../lib/device';
import { uploadToMake } from '../../lib/make';
import { startRecording, stopRecordingGetFile } from '../../lib/recording';
import { theme } from '../../lib/theme';
import BodyText from '../../primitives/BodyText';
import Button from '../../primitives/Button';
import Heading from '../../primitives/Heading';
import { useAuth } from '../../providers/AuthProvider';
import { useEntitlement } from '../../providers/EntitlementsProvider';

type RecordingState = 'idle' | 'recording' | 'review';

export default function Tell() {
  const router = useRouter();
  const { user } = useAuth();
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

  // Timer for recording
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordingState === 'recording') {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  // Load saved context
  React.useEffect(() => {
    loadSavedContext();
  }, []);

  // Save context as user types
  React.useEffect(() => {
    if (context) {
      AsyncStorage.setItem('pendingContext', context);
    }
  }, [context]);

  const loadSavedContext = async () => {
    try {
      const saved = await AsyncStorage.getItem('pendingContext');
      if (saved) setContext(saved);
    } catch (error) {
      console.error('Failed to load context:', error);
    }
  };

  const clearSavedContext = async () => {
    try {
      await AsyncStorage.removeItem('pendingContext');
    } catch (error) {
      console.error('Failed to clear context:', error);
    }
  };

  function withAccess(action: () => void) {
    if (canUsePaid) action();
    else router.replace('/trial/paywall');
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
        if (error instanceof Error && error.message.includes('Permission')) {
          setPermissionDenied(true);
        }
      }
    } else if (recordingState === 'recording') {
      try {
        const result = await stopRecordingGetFile();
        setAudioUri(result.uri);
        setAudioDuration(result.duration);
        setRecordingState('review');
        setRecordingTime(0);
      } catch (error) {
        console.error('Stop recording failed:', error);
        setRecordingState('idle');
      }
    }
  };

  const handleSave = async () => {
    if (!audioUri || !user) return;

    setUploading(true);
    setUploadError(null);

    try {
      // Validate audio
      const validation = validateAudioFile(audioUri, audioDuration);
      if (!validation.valid) {
        setUploadError(validation.error || 'Invalid audio file');
        return;
      }

      const deviceId = await getDeviceId();
      
      const result = await uploadToMake({
        audioUri,
        filename: 'story.m4a',
        mimeType: 'audio/m4a',
        userId: user.uid || 'anonymous',
        title: reviewTitle,
        durationSec: audioDuration,
        contextbox: context,
        clientId: deviceId,
      });

      // Clear saved context on successful upload
      await clearSavedContext();
      
      // Navigate to processing
      router.replace(`/processing?storyId=${result.storyId}`);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMicButtonLabel = () => {
    if (recordingState === 'idle') return 'Tap to Record';
    if (recordingState === 'recording') return 'Tap to Stop';
    return 'Recording Complete';
  };

  const tryAgainPermission = () => {
    setPermissionDenied(false);
    withAccess(handleMicPress);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.m, paddingBottom: theme.spacing.xl }}>
        {/* Header */}
        <Heading size="xl" style={{ textAlign: 'center', marginBottom: theme.spacing.xl }}>
          Ready to tell your story?
        </Heading>

        {/* Context Input */}
        <View style={{ marginBottom: theme.spacing.m }}>
          <TextInput
            value={context}
            onChangeText={setContext}
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

        {/* Decorative Wave Area */}
        <View style={{
          height: 120,
          backgroundColor: theme.colors.optionInactive,
          borderRadius: theme.radii.md,
          marginBottom: theme.spacing.xl,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 48, opacity: 0.3 }}>〜</Text>
        </View>

        {/* Permission Denied Panel */}
        {permissionDenied && (
          <View style={{
            backgroundColor: theme.colors.error,
            borderRadius: theme.radii.md,
            padding: theme.spacing.l,
            marginBottom: theme.spacing.l,
          }}>
            <BodyText style={{ color: theme.colors.bgAlt, marginBottom: theme.spacing.m }}>
              Microphone access is required to record your story.
            </BodyText>
            <View style={{ flexDirection: 'row', gap: theme.spacing.m }}>
              <Button
                title="Open Settings"
                variant="secondary"
                onPress={() => {
                  // In a real app, this would open system settings
                  Alert.alert('Open Settings', 'Please enable microphone access in your device settings.');
                }}
              />
              <Button
                title="Try Again"
                variant="secondary"
                onPress={tryAgainPermission}
              />
            </View>
          </View>
        )}

        {/* Recording Control */}
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
          <Pressable
            onPress={() => withAccess(handleMicPress)}
            disabled={recordingState === 'review'}
            style={({ pressed }) => ({
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: recordingState === 'recording' ? theme.colors.error : theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.m,
              opacity: pressed ? 0.9 : 1,
              ...theme.shadows.cardMd,
            })}
          >
            <Text style={{ fontSize: 48, color: theme.colors.bgAlt }}>
              {recordingState === 'recording' ? '⏹' : '🎤'}
            </Text>
          </Pressable>
          
          <BodyText style={{ textAlign: 'center', marginBottom: theme.spacing.xs }}>
            {getMicButtonLabel()}
          </BodyText>
          
          <Text style={{ ...theme.typography.titleM, color: theme.colors.text }}>
            {formatTime(recordingTime)}
          </Text>
        </View>

        {/* Ready Ritual Link */}
        <Pressable
          onPress={() => router.push('/readyritual')}
          style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}
        >
          <View style={{
            backgroundColor: theme.colors.bgAlt,
            borderRadius: theme.radii.md,
            padding: theme.spacing.l,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.btnBorder,
            ...theme.shadows.cardSm,
          }}>
            <Text style={{ fontSize: 24, marginBottom: theme.spacing.xs }}>📖</Text>
            <BodyText style={{ fontWeight: '600' }}>Ready Ritual</BodyText>
          </View>
        </Pressable>
      </ScrollView>

      {/* Review Dialog */}
      <Modal
        visible={recordingState === 'review'}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
          <View style={{ flex: 1, padding: theme.spacing.l }}>
            <Heading size="m" style={{ textAlign: 'center', marginBottom: theme.spacing.l }}>
              Review Your Story
            </Heading>

            {/* Title Input */}
            <View style={{ marginBottom: theme.spacing.l }}>
              <BodyText style={{ marginBottom: theme.spacing.xs, fontWeight: '600' }}>
                Title
              </BodyText>
              <TextInput
                value={reviewTitle}
                onChangeText={setReviewTitle}
                style={{
                  backgroundColor: theme.colors.bgAlt,
                  borderRadius: theme.radii.md,
                  padding: theme.spacing.l,
                  borderWidth: 1,
                  borderColor: theme.colors.btnBorder,
                  ...theme.typography.body,
                  color: theme.colors.text,
                }}
                placeholderTextColor={`${theme.colors.text}80`}
              />
            </View>

            {/* Duration */}
            <View style={{ marginBottom: theme.spacing.l }}>
              <BodyText style={{ marginBottom: theme.spacing.xs, fontWeight: '600' }}>
                Length
              </BodyText>
              <BodyText>{formatTime(audioDuration)}</BodyText>
            </View>

            {/* Error Display */}
            {uploadError && (
              <View style={{
                backgroundColor: theme.colors.error,
                borderRadius: theme.radii.md,
                padding: theme.spacing.m,
                marginBottom: theme.spacing.l,
              }}>
                <BodyText style={{ color: theme.colors.bgAlt }}>
                  {uploadError}
                </BodyText>
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: theme.spacing.m, marginTop: 'auto' }}>
              <Button
                title="Delete"
                variant="secondary"
                onPress={() => withAccess(handleDelete)}
                style={{ flex: 1 }}
              />
              <Button
                title={uploading ? 'Saving...' : 'Save'}
                variant="primary"
                onPress={() => withAccess(handleSave)}
                disabled={uploading || (!BUILD_ALLOW_TELL && !hasAccess)}
                style={{ flex: 1 }}
              />
            </View>
      </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}