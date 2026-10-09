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
