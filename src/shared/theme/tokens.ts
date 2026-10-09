export const colors = {
  brand: '#002096',
  brandPressed: '#00166E',
  brandSubtle: '#EEF1FF',
  brandSoft: '#C7D0F5',
  brandStrong: '#00124F',
  background: '#F5F6FA',
  surface: '#FFFFFF',
  surface2: '#F2F4F7',
  surface3: '#E4E7EC',
  text: '#101828',
  textMuted: '#667085',
  border: '#D0D5DD',
  disabled: '#98A2B3',
  placeholder: '#667085',
  danger: '#B42318',
  dangerStrong: '#B3192B',
  dangerSoft: '#FEDADA',
  positive: '#00693C',
  positiveSoft: '#DCF5E9',
  warning: '#6B5900',
  warningSoft: '#FFF4C2',
  info: '#28B9DA',
  infoSoft: '#DDF7FC',
  offline: '#6B5900',
  onBrand: '#FFFFFF',
  accent: '#3D56D6',
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
  familyRegular: 'Inter_400Regular',
  familyMedium: 'Inter_500Medium',
  familyBold: 'Inter_700Bold',
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
