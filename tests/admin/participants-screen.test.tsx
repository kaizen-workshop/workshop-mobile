import { fireEvent, render, screen } from '@testing-library/react-native';

import { ParticipantsScreen } from '@/admin';

const participants = [
  {
    registrationId: 'r1',
    userId: 'u1',
    name: 'Ana Souza',
    email: 'ana@x.com',
    registrationStatus: 'CONFIRMED',
    paymentStatus: 'EXEMPT',
    attendanceStatus: null,
  },
  {
    registrationId: 'r2',
    userId: 'u2',
    name: 'Bruno Lima',
    email: 'bruno@x.com',
    registrationStatus: 'WAITING_LIST',
    paymentStatus: 'PENDING',
    attendanceStatus: null,
  },
];

function setup() {
  const onExport = jest.fn();
  render(
    <ParticipantsScreen
      canSimulatePayments={false}
      onExport={onExport}
      onMarkAttendance={jest.fn()}
      onRetry={jest.fn()}
      onSimulate={jest.fn()}
      participants={participants}
      payments={[]}
      status="success"
    />,
  );
  return { onExport };
}

it('filters participants by name, e-mail or badge', () => {
  setup();
  fireEvent.changeText(screen.getByLabelText('Buscar participante'), 'bruno');
  expect(screen.queryByText('Ana Souza')).toBeNull();
  expect(screen.getByText('Bruno Lima')).toBeTruthy();

  fireEvent.changeText(screen.getByLabelText('Buscar participante'), 'zzz');
  expect(screen.getByText(/Ninguém encontrado/)).toBeTruthy();
});

it('offers CSV and XLSX exports', () => {
  const { onExport } = setup();
  fireEvent.press(screen.getByRole('button', { name: 'Exportar CSV' }));
  fireEvent.press(
    screen.getByRole('button', { name: 'Exportar planilha (XLSX)' }),
  );
  expect(onExport).toHaveBeenNthCalledWith(1, 'CSV');
  expect(onExport).toHaveBeenNthCalledWith(2, 'XLSX');
});

it('asks for confirmation before declining a payment', () => {
  const onSimulate = jest.fn();
  render(
    <ParticipantsScreen
      canSimulatePayments
      onExport={jest.fn()}
      onMarkAttendance={jest.fn()}
      onRetry={jest.fn()}
      onSimulate={onSimulate}
      participants={participants}
      payments={[
        {
          paymentId: 'p1',
          registrationId: 'r2',
          participantName: 'Bruno Lima',
          participantEmail: 'bruno@x.com',
          amount: 149.9,
          status: 'PENDING',
          method: 'PIX',
        },
      ]}
      status="success"
    />,
  );

  expect(screen.getByText('Pendente')).toBeTruthy();
  expect(screen.getAllByText('R$ 149,90').length).toBeGreaterThanOrEqual(2);
  fireEvent.press(screen.getByRole('button', { name: 'Recusar' }));
  expect(onSimulate).not.toHaveBeenCalled();
  expect(screen.getByText(/libera a vaga/)).toBeTruthy();

  fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
  expect(screen.queryByText(/libera a vaga/)).toBeNull();

  fireEvent.press(screen.getByRole('button', { name: 'Recusar' }));
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar recusa' }));
  expect(onSimulate).toHaveBeenCalledWith('p1', 'declined');
});
