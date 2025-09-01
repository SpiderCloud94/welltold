import { Feather } from '@expo/vector-icons';
import { Link, Redirect, Stack, usePathname, type Href } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../lib/theme';
import BodyText from '../../primitives/BodyText';
import { useAuth } from '../../providers/AuthProvider';

function BottomTabs() {
  const pathname = usePathname();
  // highlight when route starts with these
  const isTell     = pathname?.startsWith('/tell')     || pathname?.startsWith('/readyritual');
  const isVault    = pathname === '/'                   || pathname?.startsWith('/vault') || pathname?.startsWith('/story');
  const isSettings = pathname?.startsWith('/settings');

  const Item = ({ to, label, iconName, active }: { to: Href; label: string; iconName: keyof typeof Feather.glyphMap; active?: boolean }) => {
    const color = active ? theme.colors.primary : theme.colors.text;
    const opacity = active ? 1 : 0.7;
    
    return (
      <Link href={to} asChild>
        <Pressable style={{
          flex: 1, alignItems: 'center', paddingVertical: theme.spacing.s,
          borderTopWidth: active ? 2 : 1,
          borderTopColor: active ? theme.colors.primary : theme.colors.btnBorder,
          backgroundColor: theme.colors.bgAlt,
        }}>
          <Feather name={iconName} size={20} color={color} style={{ opacity, marginBottom: 2 }} />
          <BodyText style={{ opacity }}>{label}</BodyText>
        </Pressable>
      </Link>
    );
  };

  const TO_TELL: Href = '/(app)/tell';
  const TO_VAULT: Href = '/(app)/vault';
  const TO_SETTINGS: Href = '/(app)/settings';

  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.colors.bgAlt }}>
      <View style={{ flexDirection: 'row' }}>
        <Item to={TO_TELL} label="Tell" iconName="mic" active={isTell} />
        <Item to={TO_VAULT} label="Vault" iconName="archive" active={isVault} />
        <Item to={TO_SETTINGS} label="Settings" iconName="settings" active={isSettings} />
      </View>
    </SafeAreaView>
  );
}

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <Stack screenOptions={{ headerShown: false }} />
      {/* Bottom tabs shown on all (app) routes */}
      <BottomTabs />
    </View>
  );
}