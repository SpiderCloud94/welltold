import { StyleSheet, View, ViewProps } from 'react-native';
import { theme } from '../lib/theme';

export default function Card(props: ViewProps) {
  return <View {...props} style={[styles.card, props.style]} />;
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
});


