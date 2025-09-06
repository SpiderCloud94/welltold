// app/(app)/search.tsx
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUser } from '@clerk/clerk-expo';
import { db } from '../../lib/firebase';
import { theme } from '../../lib/theme';
import BodyText from '../../primitives/BodyText';
import Heading from '../../primitives/Heading';
import ListCard from '../../primitives/ListCard';

type StoryItem = {
  id: string;
  title?: string;
  status?: 'queued' | 'transcribing' | 'analyzing' | 'ready' | 'failed';
  createdAt?: any; // Firestore Timestamp | {seconds:number} | ISO string
};

export default function Search() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  React.useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace('/(auth)/sign-in');
  }, [isLoaded, isSignedIn]);
  if (!isLoaded || !isSignedIn) return null;

  const [allStories, setAllStories] = React.useState<StoryItem[]>([]);
  const [filteredStories, setFilteredStories] = React.useState<StoryItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [debounceTimeout, setDebounceTimeout] = React.useState<
    ReturnType<typeof setTimeout> | null
  >(null);

  // Subscribe once to user's stories (ordered by createdAt desc)
  React.useEffect(() => {
    if (!user) return;
    console.log('[search] listen path:', 'users', user.id, 'vaultentry');
    let unsub: (() => void) | undefined;
    try {
      const qy = query(
        collection(db, `users/${user.id}/vaultentry`),
        orderBy('createdAt', 'desc'),
      );
      unsub = onSnapshot(qy, (snap) => {
        const items: StoryItem[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
        setAllStories(items);
        setFilteredStories(items.slice(0, 10));
        setInitialLoading(false);
      }, (err) => console.error('[search] onSnapshot error (ordered):', err));
    } catch (e) {
      console.warn('[search] falling back to unordered snapshot (likely index missing)', e);
      unsub = onSnapshot(
        collection(db, `users/${user.id}/vaultentry`),
        (snap) => {
          const items: StoryItem[] = [];
          snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
          setAllStories(items);
          setFilteredStories(items.slice(0, 10));
          setInitialLoading(false);
        },
        (err) => console.error('[search] onSnapshot error (unordered):', err),
      );
    }
    return () => unsub && unsub();
  }, [user]);

  // Debounce filter by 200ms
  React.useEffect(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const t = setTimeout(() => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) {
        // Empty query → recent 10
        setFilteredStories(allStories.slice(0, 10));
      } else {
        setFilteredStories(
          allStories.filter((item) =>
            (item.title || 'Untitled').toLowerCase().includes(q),
          ),
        );
      }
    }, 200);
    setDebounceTimeout(t);
    return () => clearTimeout(t);
  }, [searchQuery, allStories]);

  function formatDate(v: any) {
    try {
      if (v?.toDate) return v.toDate().toLocaleDateString();
      if (typeof v?.seconds === 'number')
        return new Date(v.seconds * 1000).toLocaleDateString();
      const d = new Date(v);
      if (!isNaN(+d)) return d.toLocaleDateString();
    } catch {}
    return '--';
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.m,
          paddingBottom: theme.spacing.m,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ padding: theme.spacing.s }}>
          <Text style={{ fontSize: 18 }}>←</Text>
        </Pressable>
        <Heading size="xl" style={{ flex: 1, textAlign: 'center' }}>
          Search
        </Heading>
        <View style={{ width: 32 }} />
      </View>

      {/* Input */}
      <View style={{ paddingHorizontal: theme.spacing.m, marginBottom: theme.spacing.m }}>
        <TextInput
          autoFocus
          placeholder="Search by title…"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.btnBorder,
            borderRadius: theme.radii.md,
            padding: theme.spacing.m,
            backgroundColor: theme.colors.bgAlt,
          }}
          placeholderTextColor={`${theme.colors.text}80`}
        />
      </View>

      {/* First-load skeleton */}
      {initialLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : filteredStories.length === 0 && searchQuery.trim() ? (
        // Empty result (only when user typed something)
        <BodyText style={{ textAlign: 'center', marginTop: theme.spacing.xl }}>
          No matches.
        </BodyText>
      ) : (
        <FlatList
          data={filteredStories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.m,
            paddingBottom: theme.spacing.xl,
          }}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.m }} />}
          renderItem={({ item }) => (
            <ListCard
              title={item.title || 'Untitled'}
              meta={formatDate(item.createdAt)}
              onPress={() => {
                if (item.status === 'ready') {
                  // Your structure is app/(app)/story/[id].tsx → use pathname+params form
                  router.push({ pathname: '/story/[id]', params: { id: item.id } });
                } else {
                  router.push({ pathname: '/processing', params: { storyId: item.id } });
                }
              }}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}