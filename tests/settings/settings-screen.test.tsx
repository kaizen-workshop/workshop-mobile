import { fireEvent, render, screen } from '@testing-library/react-native';

import { SettingsScreen } from '@/settings';

function setup(overrides = {}) {
  const handlers = {
    onTogglePush: jest.fn(),
    onOpenProfile: jest.fn(),
    onOpenChangePassword: jest.fn(),
    onOpenNotifications: jest.fn(),
    onOpenPreferences: jest.fn(),
    onLogout: jest.fn(),
  };
  render(
    <SettingsScreen
      pushBusy={false}
      pushDescription="Receba avisos."
      pushEnabled={false}
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

it('groups settings into the sections of the design', () => {
  setup();
  expect(screen.getByText('Conta')).toBeTruthy();
  expect(screen.getByText('Notificações')).toBeTruthy();
  expect(screen.getByText('Aplicativo')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeTruthy();
});

it('opens account destinations and signs out', () => {
  const { onOpenProfile, onOpenChangePassword, onLogout } = setup();
  fireEvent.press(screen.getByRole('button', { name: 'Dados pessoais' }));
  fireEvent.press(screen.getByRole('button', { name: 'Alterar senha' }));
  fireEvent.press(screen.getByRole('button', { name: 'Sair da conta' }));
  expect(onOpenProfile).toHaveBeenCalled();
  expect(onOpenChangePassword).toHaveBeenCalled();
  expect(onLogout).toHaveBeenCalled();
});

it('toggles push notifications and explains the current state', () => {
  const { onTogglePush } = setup({ pushDescription: 'Permissão negada.' });
  expect(screen.getByText('Permissão negada.')).toBeTruthy();
  fireEvent(screen.getByLabelText('Notificações push'), 'valueChange', true);
  expect(onTogglePush).toHaveBeenCalledWith(true);
});

it('shows a busy indicator instead of the switch while updating', () => {
  setup({ pushBusy: true });
  expect(screen.getByLabelText('Atualizando notificações push')).toBeTruthy();
  expect(screen.queryByRole('switch')).toBeNull();
});

it('reveals the privacy note on demand', () => {
  setup();
  expect(screen.queryByText(/sua senha nunca é salva/)).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Privacidade' }));
  expect(screen.getByText(/sua senha nunca é salva/)).toBeTruthy();
});
