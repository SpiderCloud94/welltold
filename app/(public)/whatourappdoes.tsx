import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function WhatOurAppDoes() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>What Our App Does</Text>
      </View>
    </SafeAreaView>
  );
}
