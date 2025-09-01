import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

let cachedDeviceId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  try {
    let deviceId = await AsyncStorage.getItem('deviceId');
    
    if (!deviceId) {
      // Generate a new device ID
      deviceId = Crypto.randomUUID();
      await AsyncStorage.setItem('deviceId', deviceId);
    }

    cachedDeviceId = deviceId;
    return deviceId;
  } catch (error) {
    console.error('Failed to get device ID:', error);
    // Fallback to a temporary ID
    const fallbackId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    cachedDeviceId = fallbackId;
    return fallbackId;
  }
}
