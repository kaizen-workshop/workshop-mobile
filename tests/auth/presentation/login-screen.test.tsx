import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { LoginScreen } from '@/auth/presentation/login-screen';

it('renders accessible login controls', () => {
  render(<LoginScreen onSubmit={jest.fn()} />);
  expect(screen.getByLabelText('Usuário ou e-mail')).toBeTruthy();
  expect(screen.getByLabelText('Senha')).toBeTruthy();
  expect(screen.getByRole('header', { name: 'Entrar' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Entrar' })).toBeTruthy();
});

it('announces and disables a pending login action', async () => {
  let finishLogin!: () => void;
  render(
    <LoginScreen
      onSubmit={() =>
        new Promise<void>((resolve) => {
          finishLogin = resolve;
        })
      }
    />,
  );

  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
  });

  const submitButton = screen.getByRole('button', { name: 'Entrar' });
  expect(submitButton).toBeDisabled();
  expect(submitButton.props.accessibilityState).toEqual({
    busy: true,
    disabled: true,
  });

  await act(async () => finishLogin());
});

it('exposes first access and password recovery when handlers are provided', () => {
  const onFirstAccess = jest.fn();
  const onForgotPassword = jest.fn();
  render(
    <LoginScreen
      onFirstAccess={onFirstAccess}
      onForgotPassword={onForgotPassword}
      onSubmit={jest.fn()}
    />,
  );

  fireEvent.press(screen.getByRole('link', { name: 'Primeiro acesso' }));
  fireEvent.press(screen.getByRole('link', { name: 'Esqueci minha senha' }));

  expect(onFirstAccess).toHaveBeenCalledTimes(1);
  expect(onForgotPassword).toHaveBeenCalledTimes(1);
});
