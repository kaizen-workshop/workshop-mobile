import {
  BadgeCheck,
  CalendarDays,
  Cog,
  Leaf,
  Lightbulb,
  type LucideIcon,
  ShieldCheck,
  Users,
} from 'lucide-react-native';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, typography } from '@/shared/theme';

type Cover = Readonly<{ Icon: LucideIcon; background: string }>;

/** Dark backgrounds so the white icon and label keep AA contrast. */
const themed: readonly (Cover & { match: RegExp })[] = [
  { match: /seguran/i, Icon: ShieldCheck, background: '#0B3D91' },
  { match: /qualidade/i, Icon: BadgeCheck, background: '#0E6B6B' },
  { match: /sustent|ambient/i, Icon: Leaf, background: '#05603A' },
  { match: /lider|gest/i, Icon: Users, background: '#6C2BD9' },
  { match: /inova|tecnolog|digital/i, Icon: Lightbulb, background: '#B54708' },
  { match: /lean|process|industr|manufat/i, Icon: Cog, background: '#155EEF' },
];

const neutral: readonly string[] = ['#002096', '#344054', '#7A271A', '#054F31'];

/** Same title always gets the same cover; different workshops look different. */
export function coverFor(title: string, theme?: string): Cover {
  const key = `${theme ?? ''} ${title}`;
  const found = themed.find((cover) => cover.match.test(key));
  if (found) return found;
  let hash = 0;
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return { Icon: CalendarDays, background: neutral[hash % neutral.length] };
}

/** Shown instead of a photo when a workshop has none. */
export function WorkshopCover({
  style,
  theme,
  title,
}: Readonly<{
  style?: StyleProp<ViewStyle>;
  theme?: string;
  title: string;
}>) {
  const { Icon, background } = coverFor(title, theme);
  return (
    <View
      accessibilityLabel={`Capa do workshop ${title}`}
      accessibilityRole="image"
      style={[styles.cover, { backgroundColor: background }, style]}
    >
      <Icon
        color="rgba(255,255,255,0.14)"
        size={150}
        strokeWidth={1.4}
        style={styles.watermark}
      />
      <Icon color={colors.onBrand} size={44} strokeWidth={1.8} />
      {theme ? <Text style={styles.label}>{theme}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  watermark: { position: 'absolute', right: -20, bottom: -28 },
  label: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontSize: typography.bodySmall,
    fontWeight: typography.bold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
