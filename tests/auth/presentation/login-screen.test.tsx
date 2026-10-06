import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { LoginScreen } from '@/auth/presentation/login-screen';
import { AppError } from '@/core/errors';

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

  fireEvent.changeText(screen.getByLabelText('Usuário ou e-mail'), 'admin');
  fireEvent.changeText(screen.getByLabelText('Senha'), 'Workshop@2026!');
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

it('exposes first access and password recovery', () => {
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

it('logs safe technical details for a failed development login', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  render(
    <LoginScreen
      onSubmit={() =>
        Promise.reject(
          new AppError({
            category: 'network',
            technicalMessage: 'Secure storage unavailable.',
          }),
        )
      }
    />,
  );

  fireEvent.changeText(screen.getByLabelText('Usuário ou e-mail'), 'admin');
  fireEvent.changeText(screen.getByLabelText('Senha'), 'senha-incorreta');
  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
  });

  expect(log).toHaveBeenCalledWith('Authentication failed.', {
    category: 'network',
    status: undefined,
    code: undefined,
    technicalMessage: 'Secure storage unavailable.',
  });
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Não foi possível entrar. Tente novamente.',
  );
  log.mockRestore();
});

it('keeps incomplete credentials local and explains what is missing', async () => {
  const onSubmit = jest.fn();
  render(<LoginScreen onSubmit={onSubmit} />);

  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
  });

  expect(onSubmit).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Preencha seu usuário ou e-mail e a senha.',
  );
});
