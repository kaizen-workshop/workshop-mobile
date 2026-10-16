export type ColorPalette = { [Key in keyof typeof lightColors]: string };

export const lightColors = {
  brand: '#002096',
  brandPressed: '#00166E',
  brandSubtle: '#EEF1FF',
  brandSoft: '#C7D0F5',
  brandStrong: '#00124F',
  /** Brand when used as text or icon colour on a surface (differs from `brand` in dark mode). */
  brandText: '#002096',
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
  /** A liked heart is red; contrast 4.9:1 on white. */
  likeActive: '#D92D20',
};

export const darkColors: ColorPalette = {
  brand: '#4A63E8',
  brandPressed: '#3A50CC',
  brandSubtle: '#1B2547',
  brandSoft: '#2B3A78',
  brandStrong: '#B7C3FF',
  brandText: '#8FA3FF',
  background: '#0B0F1A',
  surface: '#151B2B',
  surface2: '#1C2438',
  surface3: '#262F47',
  text: '#EEF1F8',
  textMuted: '#A3ACC2',
  border: '#334060',
  disabled: '#6B7691',
  placeholder: '#8B95AD',
  danger: '#FF8A80',
  dangerStrong: '#FF6B61',
  dangerSoft: '#4A1D1D',
  positive: '#4ADE9A',
  positiveSoft: '#0F3324',
  warning: '#F5D76E',
  warningSoft: '#3D3410',
  info: '#5CD3EE',
  infoSoft: '#0E3540',
  offline: '#F5D76E',
  onBrand: '#FFFFFF',
  accent: '#8FA3FF',
  likeActive: '#FF5A4D',
};

/** Light palette. Static code and tests that are not theme-aware keep using this. */
export const colors: ColorPalette = lightColors;

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
