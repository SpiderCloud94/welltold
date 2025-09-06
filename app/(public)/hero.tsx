// app/(public)/hero.tsx
// Context: Expo + expo-router; styling via lib/theme.ts.
// Guards: No raw hex; SafeArea; public route (no auth gate).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../lib/theme';

async function markHeroSeen() {
  await AsyncStorage.setItem('wt_hero_seen', '1');
}

// If your file is elsewhere, adjust the path:
const bg = require('../../assets/images/hero.png');

export default function Hero() {
  const router = useRouter();

  //Re add this code saved in code notes on notion
  const handleContinue = async () => {
    try {
      await markHeroSeen();
      router.push('/(public)/onboarding/question1');
    } catch (error) {
      console.error('Error marking hero as seen:', error);
      // Continue anyway to avoid blocking user
      router.push('/(public)/onboarding/question1');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ImageBackground
        source={bg}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Top: brand + headline */}
          <View style={{ paddingHorizontal: theme.spacing.m, paddingTop: theme.spacing.l }}>
            <Text
              style={{
                ...theme.typography.caption,
                color: theme.colors.secondary,
                marginBottom: theme.spacing.s,
              }}
            >
              WellTold
            </Text>
            <Text
  style={[
    theme.typography.titleXL as any,
    { color: theme.colors.text }
  ]}
>
  Want to start telling{'\n'}better stories? Start{'\n'}telling them…
</Text>

          </View>

          {/* Bottom: CTA */}
          <View
            style={{
              paddingHorizontal: theme.spacing.m,
              paddingBottom: theme.spacing.xl,
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue"
              onPress={handleContinue}
              style={{
                backgroundColor: theme.colors.text, // dark pill from tokens
                borderRadius: theme.radii.pill,
                paddingVertical: 14,
                paddingHorizontal: 24,
                alignItems: 'center',
                justifyContent: 'center',
                // subtle shadow
                ...theme.shadows.cardSm,
              }}
            >
              <Text style={{ color: theme.colors.bg, fontSize: 18 }}>›</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

