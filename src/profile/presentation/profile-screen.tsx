import {
  CalendarDays,
  ChevronRight,
  History,
  type LucideIcon,
  Settings,
  Users,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { ProfileUpdate, UserProfile } from '@/profile/domain/profile';
import { BackHeader, StatePage } from '@/navigation';
import { ErrorState, LoadingState } from '@/shared/presentation';
import {
  colors,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} from '@/shared/theme';

export type ProfileStats = Readonly<{
  completed: number;
  active: number;
  waiting: number;
}>;

type Props = Readonly<{
  profile?: UserProfile;
  stats?: ProfileStats;
  status: 'loading' | 'error' | 'success';
  error?: unknown;
  saving?: boolean;
  saveError?: boolean | string;
  onRetry(): void;
  onSave(input: ProfileUpdate): Promise<void> | void;
  onOpenPreferences(): void;
  onOpenSettings(): void;
  onOpenHistory(): void;
  onOpenCalendar(): void;
  onOpenGroups(): void;
}>;

const fallback = '/(authenticated)/(tabs)/feed';

export function ProfileScreen(props: Props) {
  const frame = (node: React.ReactNode) => (
    <StatePage fallback={fallback} kind="back" title="Meu perfil">
      {node}
    </StatePage>
  );
  if (props.status === 'loading')
    return frame(<LoadingState message="Carregando perfil..." />);
  if (props.status === 'error' || !props.profile)
    return frame(
      <ErrorState
        message="Não foi possível carregar o perfil."
        error={props.error}
        onRetry={props.onRetry}
      />,
    );

  const formKey = [
    props.profile.id,
    props.profile.name,
    props.profile.phone,
    props.profile.profileImage,
  ].join(':');

  return <ProfileContent key={formKey} {...props} profile={props.profile} />;
}

function ProfileContent(props: Props & { profile: UserProfile }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(props.profile.name);
  const [phone, setPhone] = useState(props.profile.phone ?? '');
  const [profileImage, setProfileImage] = useState(
    props.profile.profileImage ?? '',
  );
  const { stats } = props;

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <BackHeader fallback={fallback} title="Meu perfil" />

      <View style={styles.card}>
        <View
          accessible
          accessibilityLabel={`Perfil de ${props.profile.name}`}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initial(props.profile.name)}</Text>
        </View>
        <Text accessibilityRole="header" style={styles.name}>
          {props.profile.name}
        </Text>
        <Text style={styles.email}>{props.profile.email}</Text>

        {editing ? (
          <View style={styles.form}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              accessibilityLabel="Nome"
              onChangeText={setName}
              style={styles.input}
              value={name}
            />
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              accessibilityLabel="Telefone"
              keyboardType="phone-pad"
              onChangeText={setPhone}
              style={styles.input}
              value={phone}
            />
            <Text style={styles.label}>Referência da imagem</Text>
            <TextInput
              accessibilityLabel="Referência da imagem de perfil"
              autoCapitalize="none"
              onChangeText={setProfileImage}
              style={styles.input}
              value={profileImage}
            />
            {props.saveError ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {typeof props.saveError === 'string'
                  ? props.saveError
                  : 'Não foi possível salvar. Tente novamente.'}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                busy: props.saving,
                disabled: props.saving || !name.trim(),
              }}
              disabled={props.saving || !name.trim()}
              onPress={() =>
                props.onSave({
                  name: name.trim(),
                  phone: phone.trim() || null,
                  profileImage: profileImage.trim() || null,
                })
              }
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                (props.saving || !name.trim()) && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.primaryText}>
                {props.saving ? 'Salvando...' : 'Salvar perfil'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setEditing(false)}
              style={({ pressed }) => [
                styles.textButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.textButtonLabel}>Cancelar</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => setEditing(true)}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryText}>Editar perfil</Text>
          </Pressable>
        )}
      </View>

      {stats ? (
        <View style={styles.stats}>
          <Stat label="Concluídos" value={stats.completed} />
          <Stat label="Inscrição ativa" value={stats.active} />
          <Stat label="Em espera" value={stats.waiting} />
        </View>
      ) : null}

      <View style={styles.card}>
        <View style={styles.interestsHeader}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Seus interesses
          </Text>
          <Pressable
            accessibilityLabel="Editar interesses"
            accessibilityRole="button"
            onPress={props.onOpenPreferences}
            style={({ pressed }) => [
              styles.editLink,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.editLinkText}>Editar</Text>
          </Pressable>
        </View>
        {props.profile.themeNames.length === 0 ? (
          <Text style={styles.muted}>
            Você ainda não escolheu temas. Toque em Editar para personalizar seu
            feed.
          </Text>
        ) : (
          <View style={styles.chips}>
            {props.profile.themeNames.map((theme) => (
              <View key={theme} style={styles.chip}>
                <Text style={styles.chipText}>{theme}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.links}>
        <LinkRow
          Icon={History}
          label="Histórico de workshops"
          onPress={props.onOpenHistory}
        />
        <LinkRow
          Icon={CalendarDays}
          label="Meu calendário"
          onPress={props.onOpenCalendar}
        />
        <LinkRow
          Icon={Users}
          label="Meus grupos"
          onPress={props.onOpenGroups}
        />
        <LinkRow
          Icon={Settings}
          label="Configurações"
          last
          onPress={props.onOpenSettings}
        />
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={styles.stat}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function LinkRow({
  Icon,
  label,
  last = false,
  onPress,
}: Readonly<{
  Icon: LucideIcon;
  label: string;
  last?: boolean;
  onPress(): void;
}>) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.linkRow,
        !last && styles.linkRowDivider,
        pressed && styles.pressed,
      ]}
    >
      <Icon color={colors.textMuted} size={20} />
      <Text style={styles.linkText}>{label}</Text>
      <ChevronRight color={colors.textMuted} size={20} />
    </Pressable>
  );
}

function initial(name: string) {
  return (name.trim()[0] ?? '?').toLocaleUpperCase('pt-BR');
}

const styles = StyleSheet.create({
  page: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: sizes.contentMaxWidth,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    width: '100%',
  },
  card: {
    ...shadows.card,
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.md,
  },
  avatar: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.xxxl,
    height: 72,
    justifyContent: 'center',
    marginTop: spacing.xs,
    width: 72,
  },
  avatarText: {
    color: colors.accent,
    fontFamily: typography.familyBold,
    fontSize: typography.title,
    fontWeight: typography.bold,
  },
  name: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.heading,
    fontWeight: typography.bold,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  email: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
    marginBottom: spacing.md,
    marginTop: spacing.xxs,
    textAlign: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.xl,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
  },
  secondaryText: {
    color: colors.accent,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  pressed: { opacity: 0.72 },
  form: { gap: spacing.xs },
  label: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.label,
    fontWeight: typography.medium,
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    color: colors.text,
    fontFamily: typography.familyRegular,
    fontSize: typography.body,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  error: { color: colors.danger, marginTop: spacing.sm },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.xl,
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: sizes.touchTarget,
  },
  buttonPressed: { backgroundColor: colors.brandPressed },
  buttonDisabled: { opacity: 0.65 },
  primaryText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  textButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
  },
  textButtonLabel: {
    color: colors.accent,
    fontFamily: typography.familyMedium,
    fontWeight: typography.medium,
  },
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: {
    ...shadows.card,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    flex: 1,
    paddingVertical: spacing.md,
  },
  statValue: {
    color: colors.accent,
    fontFamily: typography.familyBold,
    fontSize: typography.heading,
    fontWeight: typography.bold,
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.caption,
    marginTop: spacing.xxs,
    textAlign: 'center',
  },
  interestsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  editLink: { minHeight: sizes.touchTarget, justifyContent: 'center' },
  editLinkText: {
    color: colors.accent,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  chipText: {
    color: colors.accent,
    fontFamily: typography.familyMedium,
    fontSize: typography.caption,
    fontWeight: typography.medium,
  },
  links: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    paddingHorizontal: spacing.md,
  },
  linkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 56,
  },
  linkRowDivider: {
    borderBottomColor: colors.surface3,
    borderBottomWidth: 1,
  },
  linkText: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.familyMedium,
    fontSize: typography.body,
    fontWeight: typography.medium,
  },
});
