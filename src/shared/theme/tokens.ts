export const colors = {
  brand: '#00579D',
  brandPressed: '#00467F',
  brandSubtle: '#E8F4FD',
  brandSoft: '#B8DFFF',
  brandStrong: '#00335C',
  background: '#F4F7FA',
  surface: '#FFFFFF',
  surface2: '#F1F2F4',
  surface3: '#E8EAED',
  text: '#191B1F',
  textMuted: '#59595E',
  border: '#CCCCCD',
  disabled: '#9D9DA1',
  placeholder: '#666A70',
  danger: '#E71717',
  dangerSoft: '#FEDADA',
  positive: '#00693C',
  positiveSoft: '#DCF5E9',
  warning: '#6B5900',
  warningSoft: '#FFF4C2',
  info: '#28B9DA',
  infoSoft: '#DDF7FC',
  offline: '#6B5900',
  onBrand: '#FAFAFA',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 36,
  xxl: 48,
  xxxl: 80,
} as const;

export const radii = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  xxl: 16,
  xxxl: 24,
  full: 999,
} as const;

export const typography = {
  familyRegular: 'Roboto_400Regular',
  familyMedium: 'Roboto_500Medium',
  familyBold: 'Roboto_700Bold',
  body: 16,
  bodySmall: 14,
  caption: 12,
  label: 14,
  heading: 22,
  title: 30,
  display: 36,
  logo: 36,
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const;

export const sizes = {
  touchTarget: 48,
  icon: 24,
  contentMaxWidth: 640,
  formMaxWidth: 440,
} as const;

export const shadows = {
  card: {
    elevation: 2,
    shadowColor: '#001B2E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  floating: {
    elevation: 6,
    shadowColor: '#001B2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
} as const;
