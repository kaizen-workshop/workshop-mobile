import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ForgotPasswordScreen } from '@/auth/presentation/forgot-password-screen';

it('renders a recovery login field and submit control', () => {
  render(<ForgotPasswordScreen onSubmit={jest.fn()} />);
  expect(screen.getByLabelText('E-mail')).toBeTruthy();
  expect(
    screen.getByRole('button', { name: 'Enviar recuperação' }),
  ).toBeTruthy();
});

it('confirms the send with a masked e-mail and the real expiry', async () => {
  const onContinue = jest.fn();
  render(<ForgotPasswordScreen onContinue={onContinue} onSubmit={jest.fn()} />);
  fireEvent.changeText(screen.getByLabelText('E-mail'), 'matheus07@gmail.com');
  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: 'Enviar recuperação' }));
  });

  expect(screen.getByText(/mat\*{5}07@gmail\.com/)).toBeTruthy();
  expect(screen.getByText('O código irá expirar em 1 hora')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Inserir código' }));
  expect(onContinue).toHaveBeenCalledTimes(1);
});
