import { fireEvent, render, screen } from '@testing-library/react-native';

const mockNavigate = jest.fn();
const mockUseRole = jest.fn();
const mockKeyboard = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    navigate: (...args: unknown[]) => mockNavigate(...args),
    canGoBack: () => false,
    back: jest.fn(),
  },
  usePathname: () => '/feed',
}));
jest.mock('@/auth/session', () => ({
  canManage: (role: string | null) => role === 'ARWEG' || role === 'ADMIN',
  useRole: () => mockUseRole(),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 24, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@/shared/hooks', () => ({
  useKeyboardVisible: () => mockKeyboard(),
}));

import { AppHeader, FloatingMenu } from '@/navigation';

beforeEach(() => {
  mockNavigate.mockClear();
  mockUseRole.mockReturnValue('PARTICIPANT');
  mockKeyboard.mockReturnValue(false);
});

it('renders one fixed menu button below the status bar', () => {
  render(<FloatingMenu />);
  const button = screen.getByRole('button', { name: 'Abrir menu' });
  const style = Object.assign({}, ...[button.props.style].flat());
  expect(style).toMatchObject({ position: 'absolute', top: 40 });
});

it('opens the drawer and navigates while keeping history', () => {
  render(<FloatingMenu />);
  fireEvent.press(screen.getByRole('button', { name: 'Abrir menu' }));
  expect(screen.queryByText('Gestão')).toBeNull();
  fireEvent.press(screen.getByRole('link', { name: /Calendário/ }));
  expect(mockNavigate).toHaveBeenCalledWith('/(authenticated)/calendar');
});

it('adds the management entry for managers', () => {
  mockUseRole.mockReturnValue('ARWEG');
  render(<FloatingMenu />);
  fireEvent.press(screen.getByRole('button', { name: 'Abrir menu' }));
  expect(screen.getByText('Gestão')).toBeTruthy();
});

it('steps aside while the keyboard is open', () => {
  mockKeyboard.mockReturnValue(true);
  render(<FloatingMenu />);
  expect(screen.queryByRole('button', { name: 'Abrir menu' })).toBeNull();
});

it('headers only reserve the space of the fixed button', () => {
  render(<AppHeader eyebrow="Conta" title="Perfil" />);
  expect(screen.getByText('Perfil')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Abrir menu' })).toBeNull();
});
