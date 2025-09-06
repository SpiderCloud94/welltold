import { router } from 'expo-router';
import { Pressable, SafeAreaView, Text, View } from 'react-native';

export default function Login() {
  const go = () => router.replace('/(auth)/sign-in' as any);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Login</Text>
        <Pressable
          onPress={go}
          style={{ marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: '#2563EB' }}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

