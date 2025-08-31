import React from 'react';
import { Button, SafeAreaView, Text, View } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';

export default function Settings() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Settings</Text>
        <Button title="Logout" onPress={signOut} />
      </View>
    </SafeAreaView>
  );
}
