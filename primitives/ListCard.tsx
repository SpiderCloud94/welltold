import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../lib/theme';

type Props = {
  title: string;
  meta?: string;           // date or "--"
  onPress?: () => void;
  testID?: string;
  disabled?: boolean;
};

export default function ListCard({ title, meta='--', onPress, testID, disabled }: Props) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.9 },
        disabled && { opacity: 0.6 },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text style={styles.title} numberOfLines={1}>{title || 'Untitled'}</Text>
          <Text style={styles.meta} numberOfLines={1}>{meta || '--'}</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgAlt,
    borderRadius: theme.radii.md,
    padding: theme.spacing.l,
    borderWidth: 1,
    borderColor: theme.colors.btnBorder,
    ...theme.shadows.cardSm,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  textCol: { flex: 1, gap: 4 },
  title: { ...theme.typography.body, color: theme.colors.text, fontWeight: '600' },
  meta:  { ...theme.typography.caption, color: theme.colors.text },
  chev:  { ...theme.typography.titleM, color: theme.colors.text, paddingLeft: theme.spacing.m },
});


