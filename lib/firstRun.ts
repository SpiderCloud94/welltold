import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'firstRun.seenHero';

export async function hasSeenHero(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEY);
  return v === '1';
}

export async function markHeroSeen(): Promise<void> {
  await AsyncStorage.setItem(KEY, '1');
}
