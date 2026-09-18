import { render, screen } from '@testing-library/react-native';
import { ForgotPasswordScreen } from '@/auth/presentation/forgot-password-screen';

it('renders a recovery login field and submit control', () => {
  render(<ForgotPasswordScreen onSubmit={jest.fn()} />);
  expect(screen.getByLabelText('Usuário ou e-mail')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Enviar código' })).toBeTruthy();
});
