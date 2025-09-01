import { StyleSheet, Text, TextProps } from 'react-native';
import { theme } from '../lib/theme';

export default function BodyText(props: TextProps) {
  return <Text {...props} style={[styles.body, props.style]} />;
}

const styles = StyleSheet.create({
  body: { ...theme.typography.body, color: theme.colors.text },
});


