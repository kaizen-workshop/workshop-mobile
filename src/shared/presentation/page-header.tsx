import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/shared/theme';

export function PageHeader({
  description,
  eyebrow,
  title,
}: Readonly<{
  description?: string;
  eyebrow?: string;
  title: string;
}>) {
  return (
    <View style={styles.header}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </View>
  );
}

export function InlineNotice({
  message,
  tone = 'info',
}: Readonly<{
  message: string;
  tone?: 'info' | 'warning';
}>) {
  return (
    <View
      accessibilityRole="alert"
      style={[styles.notice, tone === 'warning' && styles.noticeWarning]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[
          styles.noticeMarker,
          tone === 'warning' && styles.noticeMarkerWarning,
        ]}
      />
      <Text style={styles.noticeText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  eyebrow: {
    color: colors.brand,
    fontFamily: typography.familyBold,
    fontSize: typography.caption,
    fontWeight: typography.bold,
    letterSpacing: 1.2,
    marginBottom: spacing.xxs,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.title,
    fontWeight: typography.bold,
    lineHeight: 36,
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.body,
    lineHeight: 23,
    marginTop: spacing.xs,
  },
  notice: {
    alignItems: 'center',
    backgroundColor: colors.infoSoft,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.sm,
  },
  noticeWarning: {
    backgroundColor: colors.warningSoft,
  },
  noticeMarker: {
    backgroundColor: colors.brand,
    borderRadius: 999,
    height: 8,
    marginRight: spacing.sm,
    width: 8,
  },
  noticeMarkerWarning: {
    backgroundColor: colors.warning,
  },
  noticeText: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.familyMedium,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
});
