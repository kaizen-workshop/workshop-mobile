import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getEnvironment } from '@/core/config';
import { createAuthenticatedHttpClient } from '@/core/http';
import { createTokenStorage } from '@/core/secure-storage';
import {
  BackHeader,
  getSelectedGroup,
  selectGroup,
  selectWorkshop,
  StatePage,
} from '@/navigation';
import { createApiGroupGateway, type WorkshopGroup } from '@/group';
import { ErrorState, LoadingState } from '@/shared/presentation';
import { colors, radii, sizes, spacing, typography } from '@/shared/theme';
export default function GroupRoute() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? getSelectedGroup()?.id ?? '';
  const gateway = useMemo(
    () =>
      createApiGroupGateway(
        createAuthenticatedHttpClient(getEnvironment()),
        createTokenStorage(),
      ),
    [],
  );
  const [group, setGroup] = useState<WorkshopGroup>();
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const [loadError, setLoadError] = useState<unknown>();
  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setGroup(await gateway.load(id));
      setStatus('success');
    } catch (cause) {
      setLoadError(cause);
      setStatus('error');
    }
  }, [gateway, id]);
  useEffect(() => {
    let active = true;
    void gateway
      .load(id)
      .then((value) => {
        if (!active) return;
        setGroup(value);
        setStatus('success');
      })
      .catch((cause) => {
        if (active) {
          setLoadError(cause);
          setStatus('error');
        }
      });
    return () => {
      active = false;
    };
  }, [gateway, id]);
  const frame = (node: React.ReactNode) => (
    <StatePage eyebrow="Comunidade" kind="back" title="Detalhes do grupo">
      {node}
    </StatePage>
  );
  if (status === 'loading') return frame(<LoadingState />);
  if (status === 'error' || !group)
    return frame(
      <ErrorState
        error={loadError}
        overrides={{
          not_found: 'O grupo não está disponível ou foi encerrado.',
          forbidden: 'Seu acesso a este grupo foi removido.',
        }}
        onRetry={load}
      />,
    );
  return (
    <View style={styles.page}>
      <BackHeader eyebrow="Comunidade" title="Detalhes do grupo" />
      <Text accessibilityRole="header" style={styles.title}>
        {group.workshopTitle}
      </Text>
      <Text style={styles.status}>
        {group.active ? 'Grupo ativo' : 'Grupo encerrado'}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          selectGroup({ id: group.id, title: group.workshopTitle });
          router.push('/(authenticated)/chat');
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Abrir chat</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          selectWorkshop({ id: group.workshopId });
          router.push('/(authenticated)/workshop');
        }}
        style={styles.secondary}
      >
        <Text>Ver workshop</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1, padding: spacing.lg },
  title: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.title,
  },
  status: { color: colors.textMuted, marginVertical: spacing.md },
  button: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.lg,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
  },
  buttonText: { color: colors.onBrand, fontFamily: typography.familyBold },
  secondary: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: sizes.touchTarget,
  },
});
