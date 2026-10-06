import { useState } from 'react';
import { CheckCircle2, Send, Star } from 'lucide-react-native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { EvaluationInput } from './api-evaluation-gateway';
import { BackHeader } from '@/navigation';
import { InlineNotice } from '@/shared/presentation';
import {
  colors,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} from '@/shared/theme';

export function EvaluationScreen({
  workshopTitle,
  submitting,
  submitted,
  error,
  onSubmit,
}: {
  workshopTitle: string;
  submitting: boolean;
  submitted: boolean;
  error?: 'ineligible' | 'error';
  onSubmit(input: EvaluationInput): Promise<void> | void;
}) {
  const [rating, setRating] = useState(5);
  const [contentRating, setContentRating] = useState(5);
  const [instructorRating, setInstructorRating] = useState(5);
  const [organizationRating, setOrganizationRating] = useState(5);
  const [comment, setComment] = useState('');
  if (submitted)
    return (
      <View style={styles.center}>
        <View style={styles.successIcon}>
          <CheckCircle2 color={colors.positive} size={36} />
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          Avaliação enviada
        </Text>
        <Text style={styles.description}>
          Obrigado por compartilhar sua experiência.
        </Text>
      </View>
    );
  return (
    <ScrollView
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <BackHeader eyebrow="Sua opinião importa" title="Avaliar workshop" />
        <Text style={styles.workshopTitle}>{workshopTitle}</Text>
        <View style={styles.card}>
          <Rating label="Nota geral" value={rating} onChange={setRating} />
          <Rating
            label="Conteúdo"
            value={contentRating}
            onChange={setContentRating}
          />
          <Rating
            label="Instrutor"
            value={instructorRating}
            onChange={setInstructorRating}
          />
          <Rating
            label="Organização"
            value={organizationRating}
            onChange={setOrganizationRating}
          />
          <Text style={styles.label}>Comentário</Text>
          <TextInput
            accessibilityLabel="Comentário"
            multiline
            maxLength={4000}
            onChangeText={setComment}
            placeholder="Conte o que funcionou bem e o que pode melhorar"
            placeholderTextColor={colors.placeholder}
            style={styles.comment}
            textAlignVertical="top"
            value={comment}
          />
        </View>
        {error ? (
          <InlineNotice
            tone="warning"
            message={
              error === 'ineligible'
                ? 'Este workshop não está elegível para avaliação ou já foi avaliado.'
                : 'Não foi possível enviar a avaliação. Tente novamente.'
            }
          />
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: submitting, disabled: submitting }}
          disabled={submitting}
          onPress={() =>
            onSubmit({
              rating,
              contentRating,
              instructorRating,
              organizationRating,
              comment: comment.trim() || null,
            })
          }
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            submitting && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {submitting ? 'Enviando...' : 'Enviar avaliação'}
          </Text>
          {!submitting ? <Send color={colors.onBrand} size={18} /> : null}
        </Pressable>
      </View>
    </ScrollView>
  );
}
function Rating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange(value: number): void;
}) {
  return (
    <View style={styles.ratingGroup}>
      <Text style={styles.label}>{label}</Text>
      <View accessibilityRole="radiogroup" style={styles.rating}>
        {[1, 2, 3, 4, 5].map((option) => (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityState={{ checked: value === option }}
            accessibilityLabel={`${label}: ${option}`}
            onPress={() => onChange(option)}
            style={({ pressed }) => [
              styles.ratingButton,
              value >= option && styles.ratingSelected,
              pressed && styles.ratingPressed,
            ]}
          >
            <Star
              color={value >= option ? colors.onBrand : colors.brand}
              fill={value >= option ? colors.onBrand : 'transparent'}
              size={20}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    flexGrow: 1,
    padding: spacing.lg,
  },
  content: {
    alignSelf: 'center',
    maxWidth: sizes.contentMaxWidth,
    width: '100%',
  },
  center: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  successIcon: {
    alignItems: 'center',
    backgroundColor: colors.positiveSoft,
    borderRadius: radii.full,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 72,
  },
  title: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.title,
  },
  description: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  workshopTitle: {
    color: colors.textMuted,
    fontFamily: typography.familyRegular,
    fontSize: typography.body,
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  ratingGroup: {
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.text,
    fontFamily: typography.familyMedium,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  rating: { flexDirection: 'row', gap: spacing.sm },
  ratingButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    minWidth: sizes.touchTarget,
  },
  ratingPressed: {
    transform: [{ scale: 0.94 }],
  },
  ratingSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  comment: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    color: colors.text,
    minHeight: 120,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: sizes.touchTarget,
  },
  buttonPressed: { backgroundColor: colors.brandPressed },
  buttonDisabled: { opacity: 0.65 },
  buttonText: {
    color: colors.onBrand,
    fontFamily: typography.familyBold,
    fontWeight: typography.bold,
  },
});
