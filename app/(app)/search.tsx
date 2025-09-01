// app/(app)/search.tsx
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React from 'react';
import {
  FlatList,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 👇 correct relative paths for a file at app/(app)/search.tsx
import { db } from '../../lib/firebase';
import { theme } from '../../lib/theme';
import BodyText from '../../primitives/BodyText';
import Heading from '../../primitives/Heading';
import ListCard from '../../primitives/ListCard';
import { useAuth } from '../../providers/AuthProvider';

type StoryItem = {
  id: string;
  title?: string;
  status?: 'queued' | 'transcribing' | 'analyzing' | 'ready' | 'failed';
  createdAt?: any; // Firestore timestamp or ISO
};

export default function Search() {
  const router = useRouter();
  const { user } = useAuth();

  const [allStories, setAllStories] = React.useState<StoryItem[]>([]);
  const [filteredStories, setFilteredStories] = React.useState<StoryItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debounceTimeout, setDebounceTimeout] = React.useState<
    ReturnType<typeof setTimeout> | null
  >(null);

  // subscribe once to user's stories
  React.useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `users/${user.uid}/vaultentry`),
      orderBy('createdAt', 'desc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      const items: StoryItem[] = [];
      snap.forEach((doc) => items.push({ id: doc.id, ...(doc.data() as any) }));
      setAllStories(items);
      setFilteredStories(items);
    });
    return unsub;
  }, [user]);

  // debounce filter
  React.useEffect(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const t = setTimeout(() => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) {
        setFilteredStories(allStories);
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
        />
      </View>

      {/* List / Empty */}
      {filteredStories.length === 0 ? (
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
                  router.push(`/story/${item.id}`);
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
