import type { RegistrationStatus } from '@/registration/domain';
import { StatusScreen } from '@/shared/presentation';

const contentByStatus: Record<
  RegistrationStatus,
  Readonly<{ label: string; description: string }>
> = {
  PENDING: {
    label: 'Pendente',
    description: 'Sua inscrição aguarda confirmação.',
  },
  CONFIRMED: {
    label: 'Confirmada',
    description: 'Sua participação está confirmada.',
  },
  WAITING_LIST: {
    label: 'Lista de espera',
    description: 'Sua inscrição está na lista de espera.',
  },
  CANCELLED: {
    label: 'Cancelada',
    description: 'A inscrição foi cancelada.',
  },
  REFUNDED: {
    label: 'Reembolsada',
    description: 'O reembolso da inscrição foi registrado.',
  },
};

export function RegistrationStatusScreen({
  status,
}: Readonly<{ status: RegistrationStatus }>) {
  const content = contentByStatus[status];

  return (
    <StatusScreen
      description={content.description}
      label={content.label}
      title="Status da inscrição"
    />
  );
}
