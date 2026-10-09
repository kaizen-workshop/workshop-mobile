import { fireEvent, render, screen } from '@testing-library/react-native';

import type { NotificationItem } from '@/notification/domain';
import { NotificationCentreScreen } from '@/notification/presentation';

const items: readonly NotificationItem[] = [
  {
    id: 'notification-1',
    type: 'REGISTRATION_CREATED',
    title: 'Inscrição criada',
    message: 'Sua inscrição foi recebida.',
    read: false,
    data: { workshopId: 'workshop-1' },
    createdAt: '2026-09-29T12:00:00Z',
  },
  {
    id: 'notification-2',
    type: 'PAYMENT_CONFIRMED',
    title: 'Pagamento confirmado',
    message: 'Seu pagamento foi aprovado.',
    read: true,
    data: {},
    createdAt: '2026-09-29T11:00:00Z',
  },
];

it('renders loading, error and empty states', () => {
  const onRetry = jest.fn();
  const { rerender } = render(
    <NotificationCentreScreen items={[]} onRetry={onRetry} status="loading" />,
  );
  expect(screen.getByLabelText('Carregando notificações')).toBeTruthy();

  rerender(
    <NotificationCentreScreen items={[]} onRetry={onRetry} status="error" />,
  );
  expect(
    screen.getByText('Não foi possível carregar as notificações.'),
  ).toBeTruthy();

  rerender(
    <NotificationCentreScreen items={[]} onRetry={onRetry} status="success" />,
  );
  expect(screen.getByText('Nenhuma notificação')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Voltar' })).toBeTruthy();
});

it('preserves API order and identifies unread notifications', () => {
  render(
    <NotificationCentreScreen
      items={items}
      onRetry={jest.fn()}
      status="success"
    />,
  );

  expect(screen.getByTestId('notification-list').props.data).toBe(items);
  expect(screen.getByLabelText('Não lida')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Voltar' })).toBeTruthy();
});

it('connects item selection and incremental loading callbacks', () => {
  const onLoadMore = jest.fn();
  const onPress = jest.fn();
  render(
    <NotificationCentreScreen
      items={items}
      onLoadMore={onLoadMore}
      onPress={onPress}
      onRetry={jest.fn()}
      status="success"
    />,
  );

  fireEvent.press(
    screen.getByRole('button', { name: 'Não lida. Inscrição criada' }),
  );
  screen.getByTestId('notification-list').props.onEndReached();

  expect(onPress).toHaveBeenCalledWith(items[0]);
  expect(onLoadMore).toHaveBeenCalledTimes(1);
});

it('does not request another page while loading', () => {
  render(
    <NotificationCentreScreen
      items={items}
      loadingMore
      onLoadMore={jest.fn()}
      onRetry={jest.fn()}
      status="success"
    />,
  );

  expect(
    screen.getByTestId('notification-list').props.onEndReached,
  ).toBeUndefined();
  expect(screen.getByLabelText('Carregando mais notificações')).toBeTruthy();
});

it('offers a retry after incremental loading fails', () => {
  const onLoadMore = jest.fn();
  render(
    <NotificationCentreScreen
      items={items}
      loadMoreError
      onLoadMore={onLoadMore}
      onRetry={jest.fn()}
      status="success"
    />,
  );

  fireEvent.press(
    screen.getByRole('button', {
      name: 'Não foi possível carregar mais. Tentar novamente',
    }),
  );
  expect(onLoadMore).toHaveBeenCalledTimes(1);
});

it('summarises unread notifications and marks them all as read', () => {
  const onMarkAllRead = jest.fn();
  render(
    <NotificationCentreScreen
      items={items}
      onMarkAllRead={onMarkAllRead}
      onRetry={jest.fn()}
      status="success"
    />,
  );

  expect(screen.getByText(/não lida/)).toBeTruthy();
  fireEvent.press(
    screen.getByRole('button', { name: 'Marcar todas como lidas' }),
  );
  expect(onMarkAllRead).toHaveBeenCalledTimes(1);
});
