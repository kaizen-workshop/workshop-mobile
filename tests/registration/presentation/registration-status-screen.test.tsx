import { render, screen } from '@testing-library/react-native';

import {
  registrationStatuses,
  type RegistrationStatus,
} from '@/registration/domain';
import { RegistrationStatusScreen } from '@/registration/presentation';

const expectedContent: Record<RegistrationStatus, RegExp> = {
  PENDING: /Pendente\. Sua inscrição aguarda confirmação\./,
  CONFIRMED: /Confirmada\. Sua participação está confirmada\./,
  WAITING_LIST: /Lista de espera\. Sua inscrição está na lista de espera\./,
  CANCELLED: /Cancelada\. A inscrição foi cancelada\./,
  REFUNDED: /Reembolsada\. O reembolso da inscrição foi registrado\./,
};

it.each(registrationStatuses)(
  'renders the %s status returned by the API',
  (status) => {
    render(<RegistrationStatusScreen status={status} />);

    expect(
      screen.getByRole('header', { name: 'Status da inscrição' }),
    ).toBeTruthy();
    expect(screen.getByLabelText(expectedContent[status])).toBeTruthy();
  },
);
