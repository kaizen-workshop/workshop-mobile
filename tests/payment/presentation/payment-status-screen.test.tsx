import { render, screen } from '@testing-library/react-native';

import { paymentStatuses, type PaymentStatus } from '@/payment/domain';
import { PaymentStatusScreen } from '@/payment/presentation';

const expectedContent: Record<PaymentStatus, RegExp> = {
  PENDING: /Pendente\. Aguardando a confirmação do pagamento\./,
  PAID: /Pago\. Pagamento confirmado\./,
  DECLINED: /Recusado\. O pagamento não foi aprovado\./,
  CANCELLED: /Cancelado\. O pagamento foi cancelado\./,
  REFUNDED: /Reembolsado\. O pagamento foi reembolsado\./,
  EXEMPT: /Isento\. Este pagamento não é necessário\./,
};

it.each(paymentStatuses)(
  'renders the %s status returned by the API',
  (status) => {
    render(<PaymentStatusScreen status={status} />);

    expect(
      screen.getByRole('header', { name: 'Status do pagamento' }),
    ).toBeTruthy();
    expect(screen.getByLabelText(expectedContent[status])).toBeTruthy();
  },
);
