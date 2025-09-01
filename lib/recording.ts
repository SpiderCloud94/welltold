import { Audio } from 'expo-av';

let recording: Audio.Recording | null = null;

export async function startRecording(): Promise<void> {
  try {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Permission denied');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    recording = newRecording;
  } catch (error) {
    console.error('Failed to start recording:', error);
    throw error;
  }
}

export async function stopRecordingGetFile(): Promise<{
  uri: string;
  duration: number;
}> {
  if (!recording) {
    throw new Error('No active recording');
  }

  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const status = await recording.getStatusAsync();
    
    if (!uri) {
      throw new Error('No recording file created');
    }

    const duration = status.isLoaded ? status.durationMillis || 0 : 0;
    
    recording = null;
    
    return {
      uri,
      duration: Math.round(duration / 1000), // Convert to seconds
    };
  } catch (error) {
    console.error('Failed to stop recording:', error);
    recording = null;
    throw error;
  }
}

export function isRecording(): boolean {
  return recording !== null;
}
