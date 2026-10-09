import { router } from 'expo-router';
import { useState } from 'react';

import {
  describeSaveFailure,
  toWorkshopInput,
  useAdminGateway,
  useTaxonomies,
  WorkshopFormScreen,
  type WorkshopFormErrors,
  type WorkshopFormValues,
  adminHref,
} from '@/admin';
import { ErrorState, LoadingState } from '@/shared/presentation';
import { StatePage } from '@/navigation';

export default function NewWorkshopRoute() {
  const gateway = useAdminGateway();
  const taxonomies = useTaxonomies();
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [serverErrors, setServerErrors] = useState<WorkshopFormErrors>();

  const back = () => {
    if (router.canGoBack()) router.back();
    else router.replace(adminHref.workshops);
  };

  if (taxonomies.status !== 'success')
    return (
      <StatePage
        eyebrow="ARWEG · Administrativo"
        fallback="/admin/workshops"
        kind="back"
        title="Novo workshop"
      >
        {taxonomies.status === 'loading' ? (
          <LoadingState message="Carregando categorias e temas..." />
        ) : (
          <ErrorState
            error={taxonomies.error}
            onRetry={() => void taxonomies.load()}
          />
        )}
      </StatePage>
    );

  const submit = async (values: WorkshopFormValues) => {
    if (busy) return;
    setBusy(true);
    setFormError(undefined);
    setServerErrors(undefined);
    try {
      const created = await gateway.createWorkshop(toWorkshopInput(values));
      router.replace(adminHref.manage(created.id));
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
      heading="Novo workshop"
      onCancel={back}
      onSubmit={(values) => void submit(values)}
      serverErrors={serverErrors}
      submitLabel="Salvar rascunho"
      subtitle="Preencha os dados. O workshop fica como rascunho até você publicar."
      themes={taxonomies.themes}
    />
  );
}
