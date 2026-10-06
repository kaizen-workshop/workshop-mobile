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
import { AppHeader } from '@/navigation';
import { AppSymbol, ErrorState, LoadingState } from '@/shared/presentation';
import {
  colors,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} from '@/shared/theme';

type Props = Readonly<{
  profile?: UserProfile;
  status: 'loading' | 'error' | 'success';
  saving?: boolean;
  saveError?: boolean;
  onRetry(): void;
  onSave(input: ProfileUpdate): Promise<void> | void;
  onOpenPreferences(): void;
  onOpenSettings(): void;
  onOpenHistory(): void;
  onOpenCalendar(): void;
  onOpenGroups(): void;
}>;

export function ProfileScreen(props: Props) {
  if (props.status === 'loading')
    return <LoadingState message="Carregando perfil..." />;
  if (props.status === 'error' || !props.profile)
    return (
      <ErrorState
        onRetry={props.onRetry}
        message="Não foi possível carregar o perfil."
      />
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
  const [name, setName] = useState(props.profile?.name ?? '');
  const [phone, setPhone] = useState(props.profile?.phone ?? '');
  const [profileImage, setProfileImage] = useState(
    props.profile?.profileImage ?? '',
  );

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <AppHeader eyebrow="Sua conta" title="Perfil" />
      <View style={styles.identityCard}>
        <View
          accessible
          accessibilityLabel={`Perfil de ${props.profile.name}`}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initials(props.profile.name)}</Text>
        </View>
        <View style={styles.identityText}>
          <Text style={styles.identityName}>{props.profile.name}</Text>
          <Text style={styles.identityDetail}>@{props.profile.username}</Text>
          <Text style={styles.identityDetail}>{props.profile.email}</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Dados pessoais</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          accessibilityLabel="Nome"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <Text style={styles.label}>Telefone</Text>
        <TextInput
          accessibilityLabel="Telefone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <Text style={styles.label}>Referência da imagem</Text>
        <TextInput
          accessibilityLabel="Referência da imagem de perfil"
          value={profileImage}
          onChangeText={setProfileImage}
          autoCapitalize="none"
          style={styles.input}
        />
        {props.saveError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            Não foi possível salvar. Tente novamente.
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
      </View>
      <Text style={styles.sectionTitle}>Atalhos</Text>
      <NavigationButton
        icon="favorite"
        label="Preferências"
        onPress={props.onOpenPreferences}
      />
      <NavigationButton
        icon="history"
        label="Histórico de workshops"
        onPress={props.onOpenHistory}
      />
      <NavigationButton
        icon="calendar_month"
        label="Meu calendário"
        onPress={props.onOpenCalendar}
      />
      <NavigationButton
        icon="groups"
        label="Meus grupos"
        onPress={props.onOpenGroups}
      />
      <NavigationButton
        icon="settings"
        label="Configurações"
        onPress={props.onOpenSettings}
      />
    </ScrollView>
  );
}

function NavigationButton({
  icon,
  label,
  onPress,
}: {
  icon: 'calendar_month' | 'favorite' | 'groups' | 'history' | 'settings';
  label: string;
  onPress(): void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.navigationButton,
        pressed && styles.navigationButtonPressed,
      ]}
    >
      <View style={styles.navigationIcon}>
        <AppSymbol
          color={colors.brand}
          fallback="•"
          name={{ ios: iconForIos(icon), android: icon, web: icon }}
          size={20}
        />
      </View>
      <Text style={styles.navigationText}>{label}</Text>
      <AppSymbol
        color={colors.textMuted}
        fallback="›"
        name={{
          ios: 'chevron.right',
          android: 'chevron_right',
          web: 'chevron_right',
        }}
        size={20}
      />
    </Pressable>
  );
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function iconForIos(
  icon: 'calendar_month' | 'favorite' | 'groups' | 'history' | 'settings',
) {
  return {
    calendar_month: 'calendar',
    favorite: 'heart.fill',
    groups: 'person.3.fill',
    history: 'clock.arrow.circlepath',
    settings: 'gearshape.fill',
  }[icon] as
    | 'calendar'
    | 'heart.fill'
    | 'person.3.fill'
    | 'clock.arrow.circlepath'
    | 'gearshape.fill';
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.md,
    maxWidth: sizes.contentMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  identityCard: {
    ...shadows.card,
    alignItems: 'center',
    backgroundColor: colors.brandStrong,
    borderRadius: radii.xxl,
    flexDirection: 'row',
    padding: spacing.md,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.brandSoft,
    borderRadius: radii.full,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  avatarText: {
    color: colors.brandStrong,
    fontFamily: typography.familyBold,
    fontSize: typography.heading,
    fontWeight: typography.bold,
  },
  identityText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  identityName: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontSize: typography.heading,
    fontWeight: typography.bold,
  },
  identityDetail: {
    color: colors.brandSoft,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
    marginTop: spacing.xxs,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  card: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.surface3,
    borderRadius: radii.xxl,
    borderWidth: 1,
    padding: spacing.md,
  },
  label: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  error: { color: colors.danger, marginTop: spacing.sm },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.lg,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  buttonPressed: { backgroundColor: colors.brandPressed },
  buttonDisabled: { opacity: 0.65 },
  primaryText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontWeight: typography.bold,
  },
  navigationButton: {
    ...shadows.card,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: sizes.touchTarget,
    padding: spacing.sm,
  },
  navigationButtonPressed: {
    opacity: 0.65,
  },
  navigationIcon: {
    alignItems: 'center',
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.lg,
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 40,
  },
  navigationText: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.familyMedium,
    fontSize: typography.body,
  },
});
