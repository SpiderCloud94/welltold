import React from 'react';
import { Button, SafeAreaView, Text, View } from 'react-native';
import { useAuth } from '../../../providers/AuthProvider';

export default function VaultHome() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Vault Home</Text>

        {/* TEMP: logout here until Settings is reachable */}
        <Button title="Logout" onPress={signOut} />

        {/* add any other temp nav/testing buttons here later */}
      </View>
    </SafeAreaView>
  );
}

