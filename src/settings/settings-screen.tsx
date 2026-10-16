import {
  Bell,
  ChevronRight,
  Heart,
  type LucideIcon,
  Lock,
  LogOut,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';

import { BackHeader } from '@/navigation';
import {
  makeStyles,
  radii,
  shadows,
  sizes,
  spacing,
  type ThemePreference,
  typography,
  useTheme,
} from '@/shared/theme';

const themeOptions: readonly { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];

const fallback = '/(authenticated)/(tabs)/profile';

type Props = Readonly<{
  pushEnabled: boolean;
  pushBusy: boolean;
  pushDescription: string;
  onTogglePush(next: boolean): void;
  onOpenProfile(): void;
  onOpenChangePassword(): void;
  onOpenNotifications(): void;
  onOpenPreferences(): void;
  onLogout(): void;
}>;

export function SettingsScreen(props: Props) {
  const styles = useStyles();
  const { colors, preference, setPreference } = useTheme();
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.content}>
        <BackHeader fallback={fallback} title="Configurações" />

        <Section title="Conta">
          <Row
            Icon={UserRound}
            label="Dados pessoais"
            onPress={props.onOpenProfile}
          />
          <Row
            Icon={Lock}
            label="Alterar senha"
            last
            onPress={props.onOpenChangePassword}
          />
        </Section>

        <Section title="Notificações">
          <View style={[styles.row, styles.divider]}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Notificações push</Text>
              <Text style={styles.rowHint}>{props.pushDescription}</Text>
            </View>
            {props.pushBusy ? (
              <ActivityIndicator
                accessibilityLabel="Atualizando notificações push"
                color={colors.brandText}
              />
            ) : (
              <Switch
                accessibilityLabel="Notificações push"
                onValueChange={props.onTogglePush}
                thumbColor={colors.surface}
                trackColor={{ false: colors.border, true: colors.brand }}
                value={props.pushEnabled}
              />
            )}
          </View>
          <Row
            Icon={Bell}
            label="Central de avisos"
            onPress={props.onOpenNotifications}
          />
          <Row
            Icon={Heart}
            label="Temas de interesse"
            last
            onPress={props.onOpenPreferences}
          />
        </Section>

        <Section title="Aparência">
          <View accessibilityRole="radiogroup" style={styles.themeOptions}>
            {themeOptions.map((option) => {
              const selected = preference === option.value;
              return (
                <Pressable
                  accessibilityLabel={`Tema ${option.label}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  key={option.value}
                  onPress={() => setPreference(option.value)}
                  style={({ pressed }) => [
                    styles.themeOption,
                    selected && styles.themeOptionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.themeOptionText,
                      selected && styles.themeOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Aplicativo">
          <Row
            Icon={ShieldCheck}
            expanded={showPrivacy}
            label="Privacidade"
            last
            onPress={() => setShowPrivacy((current) => !current)}
          />
          {showPrivacy ? (
            <Text style={styles.privacy}>
              Seus tokens ficam protegidos no dispositivo e sua senha nunca é
              salva.
            </Text>
          ) : null}
        </Section>

        <Pressable
          accessibilityRole="button"
          onPress={props.onLogout}
          style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
        >
          <LogOut color={colors.dangerStrong} size={20} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Section({
  children,
  title,
}: Readonly<{ children: React.ReactNode; title: string }>) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({
  expanded,
  Icon,
  label,
  last = false,
  onPress,
}: Readonly<{
  expanded?: boolean;
  Icon: LucideIcon;
  label: string;
  last?: boolean;
  onPress(): void;
}>) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={expanded === undefined ? undefined : { expanded }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !last && styles.divider,
        pressed && styles.pressed,
      ]}
    >
      <Icon color={colors.textMuted} size={20} />
      <Text style={[styles.rowLabel, styles.rowGrow]}>{label}</Text>
      <ChevronRight color={colors.textMuted} size={20} />
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  themeOptions: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.md,
  },
  themeOption: {
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
  },
  themeOptionSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  themeOptionText: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
  },
  themeOptionTextSelected: {
    color: colors.onBrand,
  },
  page: {
    backgroundColor: colors.background,
    flexGrow: 1,
    padding: spacing.md,
  },
  content: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: sizes.contentMaxWidth,
    width: '100%',
  },
  section: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontFamily: typography.familyMedium,
    fontSize: typography.caption,
    fontWeight: typography.medium,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 56,
  },
  divider: { borderBottomColor: colors.surface3, borderBottomWidth: 1 },
  rowText: { flex: 1, paddingVertical: spacing.xs },
  rowGrow: { flex: 1 },
  rowLabel: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.body,
    fontWeight: typography.medium,
  },
  rowHint: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.caption,
    lineHeight: 18,
    marginTop: 2,
  },
  privacy: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    paddingBottom: spacing.md,
  },
  pressed: { opacity: 0.72 },
  logout: {
    ...shadows.card,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    minHeight: 56,
  },
  logoutText: {
    color: colors.dangerStrong,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
}));
