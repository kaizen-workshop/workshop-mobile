import { WorkshopListScreen } from '@/workshop/presentation';

export default function AgendaRoute() {
  return (
    <WorkshopListScreen
      onRefresh={() => undefined}
      status="error"
      workshops={[]}
    />
  );
}
