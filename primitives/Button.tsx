import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '../lib/theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'link' | 'warning';
  disabled?: boolean;
  testID?: string;
  style?: ViewStyle;
};

export default function Button({ title, onPress, variant='primary', disabled, testID, style }: Props) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'warning' && styles.warning,
        variant === 'link' && styles.link,
        disabled && { opacity: 0.5 },
        pressed && { opacity: 0.9 },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          (variant === 'secondary' || variant === 'link') && { color: theme.colors.text },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary:  { backgroundColor: theme.colors.primary },
  secondary:{ backgroundColor: theme.colors.bgAlt, borderWidth: 1, borderColor: theme.colors.btnBorder },
  warning:  { backgroundColor: theme.colors.warning },
  link:     { backgroundColor: 'transparent' },
  text:     { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
});


