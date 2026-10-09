import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  describeSaveFailure,
  isEditable,
  toFormValues,
  toWorkshopInput,
  useAdminGateway,
  useAsyncData,
  useTaxonomies,
  WorkshopFormScreen,
  type WorkshopFormErrors,
  type WorkshopFormValues,
  adminHref,
} from '@/admin';
import { StatePage } from '@/navigation';
import { ErrorState, LoadingState } from '@/shared/presentation';

export default function EditWorkshopRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const gateway = useAdminGateway();
  const taxonomies = useTaxonomies();
  const loadWorkshop = useCallback(
    () => gateway.loadWorkshop(id),
    [gateway, id],
  );
  const loaded = useAsyncData(loadWorkshop);
  const workshop = loaded.data;
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [serverErrors, setServerErrors] = useState<WorkshopFormErrors>();

  const back = () => {
    if (router.canGoBack()) router.back();
    else router.replace(adminHref.manage(id));
  };

  const frame = (node: React.ReactNode) => (
    <StatePage
      eyebrow="ARWEG · Administrativo"
      fallback="/admin/workshops"
      kind="back"
      title="Editar workshop"
    >
      {node}
    </StatePage>
  );
  if (loaded.status === 'loading' || taxonomies.status === 'loading')
    return frame(<LoadingState message="Carregando workshop..." />);
  if (loaded.status === 'error' || !workshop)
    return frame(<ErrorState error={loaded.error} onRetry={loaded.reload} />);
  if (taxonomies.status === 'error')
    return frame(
      <ErrorState
        error={taxonomies.error}
        onRetry={() => void taxonomies.load()}
      />,
    );
  if (!isEditable(workshop.status))
    return frame(
      <ErrorState
        message="Apenas rascunhos e workshops agendados podem ser editados."
        onRetry={back}
        retryLabel="Voltar"
        title="Edição indisponível"
      />,
    );

  const submit = async (values: WorkshopFormValues) => {
    if (busy) return;
    setBusy(true);
    setFormError(undefined);
    setServerErrors(undefined);
    try {
      await gateway.updateWorkshop(
        workshop.id,
        toWorkshopInput(values, new Date(), workshop.registrationStart),
      );
      router.replace(adminHref.manage(workshop.id));
    } catch (cause) {
      const failure = describeSaveFailure(cause);
      setFormError(failure.formError);
      setServerErrors(failure.serverErrors);
    } finally {
      setBusy(false);
    }
  };

  return (
    <WorkshopFormScreen
      busy={busy}
      categories={taxonomies.categories}
      formError={formError}
      heading="Editar workshop"
      initial={toFormValues(workshop)}
      onCancel={back}
      onSubmit={(values) => void submit(values)}
      serverErrors={serverErrors}
      submitLabel="Salvar alterações"
      subtitle="Atualize os dados do workshop."
      themes={taxonomies.themes}
    />
  );
}
