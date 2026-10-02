import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/shared/theme';

export default function ProfileRoute() {
  const router = useRouter();

  return (
    <View style={styles.page}>
      <Text accessibilityRole="header" style={styles.title}>
        Perfil
      </Text>
      <Pressable
        accessibilityHint="Abre a seleção de temas de interesse"
        accessibilityRole="button"
        onPress={() => router.push('/(authenticated)/preferences')}
        style={styles.option}
      >
        <View>
          <Text style={styles.optionTitle}>Preferências</Text>
          <Text style={styles.optionDescription}>
            Escolha os temas que personalizam seu conteúdo.
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.title,
    fontWeight: typography.bold,
    marginBottom: spacing.lg,
  },
  option: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    padding: spacing.md,
  },
  optionTitle: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    fontSize: typography.body,
    fontWeight: typography.medium,
  },
  optionDescription: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    marginTop: spacing.xxs,
  },
});
