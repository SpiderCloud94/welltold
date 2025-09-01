import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '../lib/theme';

type Props = {
  icon?: string;           // e.g. "🏛️" or "🔥"
  title: string;
  body?: string;
  rightSlot?: React.ReactNode; // for streak "X Days"
  onPress?: () => void;
  active?: boolean;        // highlight using optionActive
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export default function InfoCard({ icon='🏛️', title, body, rightSlot, onPress, active, style, testID }: Props) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        active && { backgroundColor: theme.colors.optionActive },
        style,
        pressed && { opacity: 0.95 },
      ]}
    >
      <View style={styles.row}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          {body ? <Text style={styles.body}>{body}</Text> : null}
        </View>
        {rightSlot && <View style={styles.rightSlot}>{rightSlot}</View>}
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
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.m },
  icon: { ...theme.typography.titleM, color: theme.colors.text },
  textCol: { flex: 1, gap: 4 },
  title: { ...theme.typography.body, color: theme.colors.text, fontWeight: '700' },
  body:  { ...theme.typography.caption, color: theme.colors.text },
  rightSlot: { alignItems: 'flex-end', justifyContent: 'center' },
});


