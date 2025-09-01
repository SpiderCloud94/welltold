import { Link, Redirect, Stack, usePathname } from 'expo-router';
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

  const Item = ({ to, label, active }: { to: string; label: string; active?: boolean }) => (
    <Link href={to} asChild>
      <Pressable style={{
        flex: 1, alignItems: 'center', paddingVertical: theme.spacing.s,
        borderTopWidth: active ? 2 : 1,
        borderTopColor: active ? theme.colors.primary : theme.colors.btnBorder,
        backgroundColor: theme.colors.bgAlt,
      }}>
        <BodyText style={{ opacity: active ? 1 : 0.7 }}>{label}</BodyText>
      </Pressable>
    </Link>
  );

  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.colors.bgAlt }}>
      <View style={{ flexDirection: 'row' }}>
        <Item to="/tell"      label="Tell"      active={isTell} />
        <Item to="/"          label="Vault"     active={isVault} />
        <Item to="/settings"  label="Settings"  active={isSettings} />
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