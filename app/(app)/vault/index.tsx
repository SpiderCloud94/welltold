// app/(app)/vault/index.tsx
import { useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../../lib/firebase';
import { theme } from '../../../lib/theme';
import BodyText from '../../../primitives/BodyText';
import Heading from '../../../primitives/Heading';
import InfoCard from '../../../primitives/InfoCard';
import ListCard from '../../../primitives/ListCard';
import { useEntitlement } from '../../../providers/EntitlementsProvider';

type StoryItem = {
  id: string;
  title?: string | null;
  createdAt?: string | null; // ISO string
};

export default function VaultHome() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { active: entitled } = useEntitlement();
  const hasAccess = entitled;

  // Auth guard - redirect after Clerk is loaded
  // Auth guard - redirect after Clerk is loaded
React.useEffect(() => {
  if (isLoaded && isSignedIn) {
    console.log('[clerk] user.id =', user?.id); // ✅ safe to log here
  }

  if (isLoaded && !isSignedIn) {
    router.replace('/(auth)/sign-in');
  }
}, [isLoaded, isSignedIn, user, router]);

  // --- Streak state ---
  const [streak, setStreak] = React.useState<number>(1);

  // --- Stories state (from Firestore) ---
  const [stories, setStories] = React.useState<StoryItem[]>([]);
  // --- DEV ONLY: let stories open even without entitlement ---
  const BUILD_OPEN_STORY = true; // set to false before shipping

  // Focus: update streak + refresh stories
  useFocusEffect(React.useCallback(() => { updateStreak(); }, []));

  // --- Firestore listener with index fallback (NO extra files) ---
  React.useEffect(() => {
    if (!user) return;

    const colRef = collection(db, `users/${user.id}/vaultentry`);
    const orderedQ = query(colRef, orderBy('createdAt', 'desc'));

    // map snapshot → state (shared)
    const mapAndSet = (snap: any, sortLocally: boolean) => {
      const items: StoryItem[] = [];
      snap.forEach((d: any) => {
        const data = d.data() || {};
        const iso =
          data?.createdAt?.toDate?.()?.toISOString?.() ??
          (typeof data?.createdAt === 'string' ? data.createdAt : null);
        items.push({
          id: d.id,
          title: data.title || 'Untitled',
          createdAt: iso,
        });
      });

      if (sortLocally) {
        items.sort((a, b) => {
          const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
          const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
          return tb - ta; // desc
        });
      }

      setStories(items);
    };

    let orderedUnsub: (() => void) | null = null;
    let fallbackUnsub: (() => void) | null = null;

    try {
      orderedUnsub = onSnapshot(
        orderedQ,
        (snap) => mapAndSet(snap, /*sortLocally*/ false),
        (err) => {
          // Missing composite/collection index → fall back to unordered + local sort
          if ((err as any)?.code === 'failed-precondition') {
            console.warn('[vault] Missing index for createdAt; falling back to unordered snapshot.', err);
            fallbackUnsub = onSnapshot(
              colRef,
              (snap) => mapAndSet(snap, /*sortLocally*/ true),
              (e) => console.error('[vault] onSnapshot error (unordered fallback):', e)
            );
          } else {
            console.error('[vault] onSnapshot error (ordered):', err);
          }
        }
      );
    } catch (e) {
      // Extreme edge: if constructing ordered listener throws, still try unordered
      console.warn('[vault] Exception when creating ordered snapshot; using unordered fallback.', e);
      fallbackUnsub = onSnapshot(
        colRef,
        (snap) => mapAndSet(snap, /*sortLocally*/ true),
        (err) => console.error('[vault] onSnapshot error (unordered via catch):', err)
      );
    }

    return () => {
      orderedUnsub?.();
      fallbackUnsub?.();
    };
  }, [user]);

  const todayKey = React.useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    return new Date(y, m, d).toISOString();
  }, []);

  async function updateStreak() {
    const lastOpenISO = await AsyncStorage.getItem('vault.lastOpenISO');
    const currentStreakRaw = await AsyncStorage.getItem('vault.currentStreak');
    const currentStreak = currentStreakRaw ? parseInt(String(currentStreakRaw), 10) : 0;

    // Normalize dates to midnight
    const last = lastOpenISO ? new Date(lastOpenISO) : null;
    const today = new Date(todayKey);

    let nextStreak = 1;
    if (last) {
      const deltaMs = today.getTime() - new Date(new Date(last.getFullYear(), last.getMonth(), last.getDate()).toISOString()).getTime();
      const deltaDays = Math.round(deltaMs / 86400000);
      if (deltaDays === 0) {
        nextStreak = Math.max(1, currentStreak || 1);
      } else if (deltaDays === 1) {
        nextStreak = (currentStreak || 0) + 1;
      } else {
        nextStreak = 1;
      }
    }

    setStreak(nextStreak);
    await AsyncStorage.setItem('vault.lastOpenISO', today.toISOString());
    await AsyncStorage.setItem('vault.currentStreak', String(nextStreak));
  }

  function formatCreatedAt(v: any) {
    try {
      if (v?.toDate) return v.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      if (typeof v?.seconds === 'number') return new Date(v.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      const d = new Date(v);
      if (!isNaN(+d)) return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {}
    return '--';
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1, padding: theme.spacing.m }}>
        {/* Header with Search Button */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.spacing.xxl,
        }}>
          <View style={{ flex: 1 }} />
          <Heading
            size="xl"
            testID="vault-title"
            style={{ textAlign: 'center' }}
          >
            The Story Vault
          </Heading>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Pressable
              onPress={() => router.push('/(app)/search')}
              style={{
                padding: theme.spacing.s,
                backgroundColor: theme.colors.bgAlt,
                borderRadius: theme.radii.md,
                borderWidth: 1,
                borderColor: theme.colors.btnBorder,
                ...theme.shadows.cardSm,
              }}
            >
              <BodyText style={{ fontSize: 18 }}>🔍</BodyText>
            </Pressable>
          </View>
        </View>

        {/* Cards with gaps */}
        <View style={{ gap: theme.spacing.m }}>
          <InfoCard
            testID="vault-streak-card"
            icon="🔥"
            title="Practice Streak"
            rightSlot={<Text style={{ ...theme.typography.body, color: theme.colors.text, fontWeight: '600' }}>{streak} {streak === 1 ? 'Day' : 'Days'}</Text>}
            onPress={undefined}
            style={{ backgroundColor: theme.colors.streakBg }}
          />

          <InfoCard
            testID="vault-tips-card"
            icon="💡"
            title="Explore vault tips"
            active
            onPress={() => router.push('/vault/tips')}
          />
        </View>

        {/* Story list */}
        <FlatList
          data={stories}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.m }} />}
          contentContainerStyle={{ paddingTop: theme.spacing.m, paddingBottom: theme.spacing.xl }}
          renderItem={({ item }) => (
            <ListCard
              testID={`vault-story-item-${item.id}`}
              title={item.title || 'Untitled'}
              meta={formatCreatedAt(item.createdAt)}
              onPress={() => {
                if (BUILD_OPEN_STORY || hasAccess) {
                  router.push(`/story/${item.id}`);
                } else {
                  router.replace('/trial/paywall');
                }
              }}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

 
