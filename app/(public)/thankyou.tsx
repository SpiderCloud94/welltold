// Context: Expo + expo-router; styling via lib/theme.ts.
// Guards: tokens only (no raw hex); public screen.

import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../lib/theme';
import Heading from '../../primitives/Heading';

export default function ThankYou() {
  const animRef = React.useRef<LottieView>(null);

  // Play reliably whenever this screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      animRef.current?.reset();
      animRef.current?.play();
      return () => animRef.current?.pause();
    }, []),
  );

  const onContinue = useCallback(async () => {
    await AsyncStorage.setItem('onboardingDone', '1');
    router.replace('/(auth)/sign-in');         // go straight to provider buttons
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={styles.container}>
        {/* Lottie */}
        <View style={styles.animWrap}>
          <LottieView
            ref={animRef}
            source={require('../../assets/lottie/thankyou.json')}
            autoPlay
            loop={false}
            style={styles.anim}
            resizeMode="contain"
          />
        </View>

        {/* Title + subtitle */}
        <View style={styles.textBlock}>
          <Heading size="xl" style={{ textAlign: 'center' }}>
            Thank you for trusting us
          </Heading>
          <Text style={styles.subtitle}>
            🔒 We respect your privacy. Your stories and data stay secure.
          </Text>
        </View>

        {/* Bottom primary button */}
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <Pressable
            onPress={onContinue}
            style={styles.primaryBtn}
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>Continue</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  animWrap: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  anim: {
    width: '100%',
    height: 240,
  },
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    gap: theme.spacing.m,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: 'center',
  } as any,
  footer: {
    paddingBottom: theme.spacing.l,
  },
  primaryBtn: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.radii.pill,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.cardSm,
  },
  primaryBtnText: {
    ...theme.typography.body,
    color: theme.colors.bg,
    fontWeight: '700',
  } as any,
});
