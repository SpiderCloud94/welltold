import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { theme } from '../../../lib/theme';

export default function TabsLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.bgAlt,
          borderTopColor: theme.colors.btnBorder,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
      }}
    >
      <Tabs.Screen 
        name="tell" 
        options={{ 
          title: 'Tell',
          tabBarIcon: ({ color, size }) => <Feather name="mic" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="vault" 
        options={{ 
          title: 'Vault',
          tabBarIcon: ({ color, size }) => <Feather name="archive" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} />
        }} 
      />
    </Tabs>
  );
}
