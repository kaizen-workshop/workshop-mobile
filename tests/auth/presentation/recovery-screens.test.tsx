import { render, screen } from '@testing-library/react-native';
import { FirstAccessScreen } from '@/auth/presentation/first-access-screen';
import { ResetPasswordScreen } from '@/auth/presentation/reset-password-screen';

it('renders first access code controls', () => {
  render(<FirstAccessScreen onSubmit={jest.fn()} />);
  expect(screen.getByRole('header', { name: 'Entrar' })).toBeTruthy();
  expect(screen.getByLabelText('Código')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Enviar' })).toBeTruthy();
});

it('renders reset password controls', () => {
  render(<ResetPasswordScreen onSubmit={jest.fn()} />);
  expect(screen.getByLabelText('Nova senha')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Redefinir senha' })).toBeTruthy();
});
