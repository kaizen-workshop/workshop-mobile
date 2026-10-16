import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';

import { EvaluationsScreen, useAdminGateway, useAsyncData } from '@/admin';

export default function WorkshopEvaluationsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const gateway = useAdminGateway();
  const load = useCallback(async () => {
    const [workshop, summary, page] = await Promise.all([
      gateway.loadWorkshop(id),
      gateway.evaluationSummary(id),
      gateway.evaluations(id),
    ]);
    return { workshop, summary, evaluations: page.items };
  }, [gateway, id]);
  const loaded = useAsyncData(load);

  return (
    <EvaluationsScreen
      error={loaded.error}
      evaluations={loaded.data?.evaluations ?? []}
      onRetry={loaded.reload}
      status={loaded.status}
      summary={loaded.data?.summary}
      title={loaded.data?.workshop.title ?? 'Avaliações'}
    />
  );
}
