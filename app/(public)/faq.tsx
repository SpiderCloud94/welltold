import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../lib/theme';
import BodyText from '../../primitives/BodyText';
import Heading from '../../primitives/Heading';


export default function FAQPage() {
  const router = useRouter();

  const BODY = `Q: Do I own my stories?
Yes — always. Everything you record belongs to you.

Q: Is my data private?
Your recordings and feedback stay private in your vault unless you decide to share them.

Q: Does AI store or train on my stories?
No. AI only processes your story to give feedback — your content isn’t used to train models.

Q: Can I re-record or edit later?
Absolutely. The vault is built for refining and comparing different versions over time.

Q: Do I need to be a good storyteller already?
No! WellTold works for beginners and experienced speakers — guiding you step by step.

Q: What devices does it work on?
Currently available on iOS and Android mobile. 

Q: Can I use it offline?
You can record offline, but AI feedback requires an internet connection.`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.m, paddingTop: theme.spacing.s, paddingBottom: theme.spacing.l }}>
        <Pressable onPress={() => router.push('/(public)/about' as const)} style={{ padding: theme.spacing.s }}>
          <Text style={{ fontSize: 18 }}>←</Text>
        </Pressable>
        <Heading size="xl" style={{ flex: 1, textAlign: 'center' }}>FAQ</Heading>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.m, paddingBottom: theme.spacing.xl }}>
        <Heading size="m" style={{ marginBottom: theme.spacing.s }}>FAQ</Heading>
        <BodyText>{BODY}</BodyText>
      </ScrollView>
    </SafeAreaView>
  );
}

