import { View, ViewProps } from 'react-native';
import { theme } from '../lib/theme';

type Props = ViewProps & { gap?: keyof typeof theme.spacing };

export default function Stack({ children, style, gap = 'm', ...rest }: Props) {
  const g = theme.spacing[gap as keyof typeof theme.spacing] ?? theme.spacing.m;
  return (
    <View {...rest} style={[{ gap: g }, style]}>
      {children}
    </View>
  );
}


