import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { BackHeader } from '@/navigation';
import {
  colors,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} from '@/shared/theme';

export const adminEyebrow = 'ARWEG · Administrativo';

/** Scrollable page with the shared administrative header. */
export function AdminPage({
  children,
  fallback = '/admin',
  title,
}: Readonly<{ children: ReactNode; fallback?: string; title: string }>) {
  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={styles.page}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <BackHeader eyebrow={adminEyebrow} fallback={fallback} title={title} />
        {children}
      </View>
    </ScrollView>
  );
}

export function Heading({
  subtitle,
  title,
}: Readonly<{ subtitle?: string; title: string }>) {
  return (
    <View style={styles.heading}>
      <Text accessibilityRole="header" style={styles.headingTitle}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.headingSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Card({ children }: Readonly<{ children: ReactNode }>) {
  return <View style={styles.card}>{children}</View>;
}

export function SectionTitle({ children }: Readonly<{ children: string }>) {
  return (
    <Text accessibilityRole="header" style={styles.sectionTitle}>
      {children}
    </Text>
  );
}

export function Field({
  error,
  hint,
  label,
  ...input
}: Readonly<
  TextInputProps & { error?: string; hint?: string; label: string }
>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.placeholder}
        {...input}
        style={[
          styles.input,
          input.multiline && styles.inputMultiline,
          error ? styles.inputError : null,
        ]}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.fieldError}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

/** Single-choice chips; the selected one is filled with the brand color. */
export function ChoiceChips<T extends string>({
  label,
  onChange,
  options,
  value,
}: Readonly<{
  label: string;
  onChange(value: T): void;
  options: readonly { value: T; label: string }[];
  value: T | undefined;
}>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type ButtonProps = Readonly<{
  busy?: boolean;
  disabled?: boolean;
  label: string;
  onPress(): void;
}>;

export function PrimaryButton({ busy, disabled, label, onPress }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy, disabled: disabled || busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        (disabled || busy) && styles.buttonDisabled,
      ]}
    >
      {busy ? <ActivityIndicator color={colors.onBrand} size="small" /> : null}
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  busy,
  disabled,
  label,
  onPress,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy, disabled: disabled || busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonSoft,
        pressed && styles.pressed,
        (disabled || busy) && styles.buttonDisabled,
      ]}
    >
      <Text style={styles.buttonSoftText}>{label}</Text>
    </Pressable>
  );
}

export function DangerButton({ busy, disabled, label, onPress }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy, disabled: disabled || busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonDanger,
        pressed && styles.pressed,
        (disabled || busy) && styles.buttonDisabled,
      ]}
    >
      {busy ? <ActivityIndicator color={colors.onBrand} size="small" /> : null}
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function LinkButton({ label, onPress }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <Text style={styles.linkText}>{label}</Text>
    </Pressable>
  );
}

export function Notice({
  children,
  tone,
}: Readonly<{ children: ReactNode; tone: 'danger' | 'success' | 'info' }>) {
  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.notice,
        tone === 'danger' && styles.noticeDanger,
        tone === 'success' && styles.noticeSuccess,
      ]}
    >
      <Text
        style={[
          styles.noticeText,
          tone === 'danger' && { color: colors.danger },
          tone === 'success' && { color: colors.positive },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

export function StatusChip({
  background = colors.brandSubtle,
  color = colors.accent,
  label,
}: Readonly<{ background?: string; color?: string; label: string }>) {
  return (
    <View style={[styles.statusChip, { backgroundColor: background }]}>
      <Text style={[styles.statusChipText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    flexGrow: 1,
    padding: spacing.md,
  },
  content: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: sizes.contentMaxWidth,
    paddingBottom: spacing.xl,
    width: '100%',
  },
  heading: { gap: spacing.xxs },
  headingTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.heading,
    fontWeight: typography.bold,
  },
  headingSubtitle: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.bodySmall,
  },
  card: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    gap: spacing.sm,
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  field: { gap: spacing.xxs },
  label: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.label,
    fontWeight: typography.medium,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.surface3,
    borderRadius: radii.xl,
    borderWidth: 1,
    color: colors.text,
    fontFamily: typography.familyRegular,
    fontSize: typography.body,
    minHeight: sizes.touchTarget,
    outlineWidth: 0,
    paddingHorizontal: spacing.md,
  },
  inputMultiline: {
    minHeight: 96,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  inputError: { borderColor: colors.danger },
  fieldError: {
    color: colors.danger,
    fontFamily: typography.familyMedium,
    fontSize: typography.caption,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.caption,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    backgroundColor: colors.background,
    borderColor: colors.surface3,
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  chipSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
  },
  chipTextSelected: { color: colors.onBrand },
  pressed: { opacity: 0.72 },
  button: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.xl,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
  },
  buttonPressed: { backgroundColor: colors.brandPressed },
  buttonDisabled: { opacity: 0.55 },
  buttonText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  buttonSoft: {
    alignItems: 'center',
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.xl,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
  },
  buttonSoftText: {
    color: colors.accent,
    fontFamily: typography.familyBold,
    fontSize: typography.body,
    fontWeight: typography.bold,
  },
  buttonDanger: {
    alignItems: 'center',
    backgroundColor: colors.dangerStrong,
    borderRadius: radii.xl,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
  },
  link: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
  },
  linkText: {
    color: colors.brand,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
  },
  notice: {
    backgroundColor: colors.brandSubtle,
    borderRadius: radii.xl,
    padding: spacing.sm,
  },
  noticeDanger: { backgroundColor: colors.dangerSoft },
  noticeSuccess: { backgroundColor: colors.positiveSoft },
  noticeText: {
    color: colors.accent,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  statusChipText: {
    fontFamily: typography.familyMedium,
    fontSize: typography.caption,
    fontWeight: typography.medium,
  },
});
