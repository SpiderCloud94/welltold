import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../lib/theme';

type Props = {
  title: string;
  children: React.ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
  testID?: string;
};

export default function Accordion({ title, children, expanded = false, onToggle, testID }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        testID={testID}
        onPress={onToggle}
        style={({ pressed }) => [
          styles.header,
          pressed && { opacity: 0.9 },
        ]}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.chevron}>{expanded ? '⌄' : '›'}</Text>
      </Pressable>
      {expanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bgAlt,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.btnBorder,
    ...theme.shadows.cardSm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.l,
  },
  title: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  chevron: {
    ...theme.typography.titleM,
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.l,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
});
