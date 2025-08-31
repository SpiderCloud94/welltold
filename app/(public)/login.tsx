import { useRouter } from 'expo-router';
import React from 'react';
import { Button, SafeAreaView, Text, View } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth(); // ← use signIn, not setUser

  const doLogin = () => {
    // fake user
    signIn({ id: '123', email: 'test@example.com' });
    router.replace('/trial/paywall');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Login</Text>
        <Button title="Login with Google" onPress={doLogin} />
        <Button title="Login with Apple" onPress={doLogin} />
      </View>
    </SafeAreaView>
  );
}

