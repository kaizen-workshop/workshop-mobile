import { fireEvent, render, screen } from '@testing-library/react-native';

import { ProfileScreen } from '@/profile';

const profile = {
  id: '1',
  name: 'Ana Souza',
  username: 'demo.ana',
  email: 'ana.demo@workshop.local',
  themeNames: ['Esportes', 'Tecnologia'],
};

function setup(overrides = {}) {
  const handlers = {
    onRetry: jest.fn(),
    onSave: jest.fn(),
    onOpenPreferences: jest.fn(),
    onOpenSettings: jest.fn(),
    onOpenHistory: jest.fn(),
    onOpenCalendar: jest.fn(),
    onOpenGroups: jest.fn(),
  };
  render(
    <ProfileScreen
      profile={profile}
      stats={{ completed: 2, active: 1, waiting: 1 }}
      status="success"
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

it('shows identity, stats and interests like the design', () => {
  setup();
  expect(screen.getByText('Ana Souza')).toBeTruthy();
  expect(screen.getByText('ana.demo@workshop.local')).toBeTruthy();
  expect(screen.getByLabelText('Concluídos: 2')).toBeTruthy();
  expect(screen.getByLabelText('Em espera: 1')).toBeTruthy();
  expect(screen.getByText('Esportes')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Voltar' })).toBeTruthy();
});

it('keeps the edit form hidden until Editar perfil is pressed', () => {
  const { onSave } = setup();
  expect(screen.queryByLabelText('Nome')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Editar perfil' }));
  fireEvent.changeText(screen.getByLabelText('Nome'), 'Ana Maria');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar perfil' }));
  expect(onSave).toHaveBeenCalledWith({
    name: 'Ana Maria',
    phone: null,
    profileImage: null,
  });
});

it('lets the person cancel editing without saving', () => {
  const { onSave } = setup();
  fireEvent.press(screen.getByRole('button', { name: 'Editar perfil' }));
  fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
  expect(screen.queryByLabelText('Nome')).toBeNull();
  expect(onSave).not.toHaveBeenCalled();
});

it('guides people without interests and opens the shortcuts', () => {
  const { onOpenPreferences, onOpenHistory } = setup({
    profile: { ...profile, themeNames: [] },
  });
  expect(screen.getByText(/ainda não escolheu temas/)).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Editar interesses' }));
  fireEvent.press(
    screen.getByRole('button', { name: 'Histórico de workshops' }),
  );
  expect(onOpenPreferences).toHaveBeenCalled();
  expect(onOpenHistory).toHaveBeenCalled();
});
