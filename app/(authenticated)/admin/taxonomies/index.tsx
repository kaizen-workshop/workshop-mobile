import { Redirect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  adminHref,
  TaxonomyScreen,
  useAdminGateway,
  useAsyncData,
  type Taxonomy,
  type TaxonomyKind,
} from '@/admin';
import { useRole } from '@/auth/session';
import { describeError } from '@/core/errors';
import { StatePage } from '@/navigation';
import { ErrorState, LoadingState } from '@/shared/presentation';

export default function TaxonomiesRoute() {
  const role = useRole();
  const gateway = useAdminGateway();
  const [busyId, setBusyId] = useState<string>();
  const [feedback, setFeedback] = useState<{
    tone: 'danger' | 'success';
    message: string;
  }>();

  const load = useCallback(async () => {
    const [themes, categories] = await Promise.all([
      gateway.themes(),
      gateway.categories(),
    ]);
    return { themes, categories };
  }, [gateway]);
  const loaded = useAsyncData(load);

  // Taxonomy management is ADMIN-only (the API enforces it as well).
  if (role === null) return <LoadingState message="Verificando acesso..." />;
  if (role !== 'ADMIN') return <Redirect href={adminHref.home} />;

  if (loaded.status !== 'success' || !loaded.data)
    return (
      <StatePage
        eyebrow="ARWEG · Administrativo"
        fallback={adminHref.home as never}
        kind="back"
        title="Categorias e temas"
      >
        {loaded.status === 'error' ? (
          <ErrorState error={loaded.error} onRetry={loaded.reload} />
        ) : (
          <LoadingState message="Carregando..." />
        )}
      </StatePage>
    );

  const fail = (cause: unknown) =>
    setFeedback({
      tone: 'danger',
      message: describeError(cause, {
        conflict: 'Já existe um item com este nome.',
        forbidden: 'Somente administradores podem alterar categorias e temas.',
        bad_request: 'O nome não foi aceito. Revise e tente novamente.',
      }).message,
    });

  const create = async (kind: TaxonomyKind, name: string) => {
    setFeedback(undefined);
    try {
      await gateway.createTaxonomy(kind, name);
      loaded.refresh();
      setFeedback({ tone: 'success', message: `"${name}" foi adicionado.` });
      return true;
    } catch (cause) {
      fail(cause);
      return false;
    }
  };

  const deactivate = async (kind: TaxonomyKind, item: Taxonomy) => {
    if (busyId) return;
    setBusyId(item.id);
    setFeedback(undefined);
    try {
      await gateway.updateTaxonomy(kind, item.id, { active: false });
      loaded.refresh();
      setFeedback({
        tone: 'success',
        message: `"${item.name}" foi desativado.`,
      });
    } catch (cause) {
      fail(cause);
    } finally {
      setBusyId(undefined);
    }
  };

  return (
    <TaxonomyScreen
      busyId={busyId}
      categories={loaded.data.categories}
      feedback={feedback}
      onCreate={create}
      onDeactivate={(kind, item) => void deactivate(kind, item)}
      themes={loaded.data.themes}
    />
  );
}
