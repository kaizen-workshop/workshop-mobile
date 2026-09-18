import { render, screen } from '@testing-library/react-native';
import { LoginScreen } from '@/auth/presentation/login-screen';

it('renders accessible login controls', () => {
  render(<LoginScreen onSubmit={jest.fn()} />);
  expect(screen.getByLabelText('Usuário ou e-mail')).toBeTruthy();
  expect(screen.getByLabelText('Senha')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Entrar' })).toBeTruthy();
});
