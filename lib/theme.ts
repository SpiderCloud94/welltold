// lib/theme.ts
export const theme = {
  colors: {
    bg: '#F7F8FA',
    bgAlt: '#FFFFFF',
    text: '#0E1116',
    primary: '#0E1116',
    secondary: '#3B82F6',
    optionActive: '#badaf3',
    optionInactive: '#f4f4f4',
    btnBorder: '#82b1d5',
    streakBg: '#FEF3C7',
    divider: '#E5E7EB',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    bannerBg: '#E6F4FF',
    bannerText: '#0B4A8F',
  },
  spacing: { xs: 8, s: 12, m: 16, l: 20, xl: 24, xxl: 32 },
  radii: { sm: 8, md: 12, pill: 999 },
  typography: {
    titleXL: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
    titleM:  { fontSize: 20, fontWeight: '600', lineHeight: 26 },
    body:    { fontSize: 16, lineHeight: 22 },
    caption: { fontSize: 13, lineHeight: 18 },
  },
  shadows: {
    cardSm: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset:{width:0,height:3}, elevation:3 },
    cardMd: { shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 14, shadowOffset:{width:0,height:6}, elevation:6 },
  },
};
export type Theme = typeof theme;

  