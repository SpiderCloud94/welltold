import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function Hero() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Hero</Text>
      </View>
    </SafeAreaView>
  );
}
