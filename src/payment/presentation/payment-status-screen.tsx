import type { PaymentStatus } from '@/payment/domain';
import { StatusScreen } from '@/shared/presentation';

const contentByStatus: Record<
  PaymentStatus,
  Readonly<{ label: string; description: string }>
> = {
  PENDING: {
    label: 'Pendente',
    description: 'Aguardando a confirmação do pagamento.',
  },
  PAID: {
    label: 'Pago',
    description: 'Pagamento confirmado.',
  },
  DECLINED: {
    label: 'Recusado',
    description: 'O pagamento não foi aprovado.',
  },
  CANCELLED: {
    label: 'Cancelado',
    description: 'O pagamento foi cancelado.',
  },
  REFUNDED: {
    label: 'Reembolsado',
    description: 'O pagamento foi reembolsado.',
  },
  EXEMPT: {
    label: 'Isento',
    description: 'Este pagamento não é necessário.',
  },
};

export function PaymentStatusScreen({
  status,
}: Readonly<{ status: PaymentStatus }>) {
  const content = contentByStatus[status];

  return (
    <StatusScreen
      description={content.description}
      label={content.label}
      title="Status do pagamento"
    />
  );
}
