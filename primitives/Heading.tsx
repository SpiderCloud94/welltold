import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { theme } from '../lib/theme';

type HeadingProps = Omit<TextProps, 'style'> & {
  size?: 'xl' | 'm';
  style?: StyleProp<TextStyle>;
};

export default function Heading({ size = 'xl', style, ...rest }: HeadingProps) {
  const s = size === 'm' ? styles.m : styles.xl;
  return <Text {...rest} style={[s, style]} />;
}

const styles = StyleSheet.create({
  xl: { ...(theme.typography.titleXL as TextStyle), color: theme.colors.text } as TextStyle,
  m:  { ...(theme.typography.titleM  as TextStyle), color: theme.colors.text } as TextStyle,
});
