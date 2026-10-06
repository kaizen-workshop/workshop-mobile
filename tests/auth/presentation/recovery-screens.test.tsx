import { render, screen } from '@testing-library/react-native';
import { FirstAccessScreen } from '@/auth/presentation/first-access-screen';
import { ResetPasswordScreen } from '@/auth/presentation/reset-password-screen';

it('renders first access code controls', () => {
  render(<FirstAccessScreen onRequestCode={jest.fn()} onSubmit={jest.fn()} />);
  expect(screen.getByRole('header', { name: 'Primeiro acesso' })).toBeTruthy();
  expect(screen.getByLabelText('E-mail')).toBeTruthy();
  expect(screen.getByLabelText('Código')).toBeTruthy();
  expect(screen.getByLabelText('Nova senha')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Enviar código' })).toBeTruthy();
  expect(
    screen.getByRole('button', { name: 'Concluir primeiro acesso' }),
  ).toBeTruthy();
});

it('renders reset password controls', () => {
  render(<ResetPasswordScreen onSubmit={jest.fn()} />);
  expect(screen.getByLabelText('Token de recuperação')).toBeTruthy();
  expect(screen.getByLabelText('Nova senha')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Redefinir senha' })).toBeTruthy();
});
