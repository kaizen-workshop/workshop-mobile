export const colors = {
  brand: '#00579D',
  brandSoft: '#B8DFFF',
  brandStrong: '#00335C',
  background: '#FCFCFD',
  surface: '#F7F7F8',
  surface2: '#F1F2F4',
  surface3: '#E8EAED',
  text: '#191B1F',
  textMuted: '#59595E',
  border: '#CCCCCD',
  disabled: '#9D9DA1',
  placeholder: '#98989A',
  danger: '#E71717',
  dangerSoft: '#FEDADA',
  positive: '#00693C',
  warning: '#998000',
  info: '#28B9DA',
  offline: '#998000',
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
  label: 14,
  title: 30,
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
  contentMaxWidth: 480,
} as const;
