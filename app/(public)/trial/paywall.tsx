import { useRouter } from 'expo-router';
import React from 'react';
import { Button, SafeAreaView, Text, View } from 'react-native';
import { useAccess } from '../../../providers/AccessProvider';

export default function Paywall() {
  const router = useRouter();
  const { setHasAccess } = useAccess();

  const unlock = () => {
    setHasAccess(true);
    router.replace('/vault');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', rowGap: 12 }}>
        <Text>Start Free Trial</Text>
        <Button title="Start Free Trial" onPress={unlock} />
        <Button title="Skip for now" onPress={unlock} />
      </View>
    </SafeAreaView>
  );
}
