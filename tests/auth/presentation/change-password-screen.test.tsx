import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { ChangePasswordScreen } from '@/auth/presentation/change-password-screen';

function fillPasswords({
  current = 'temporaria',
  next = 'nova-senha',
  confirmation = next,
}: {
  current?: string;
  next?: string;
  confirmation?: string;
} = {}) {
  fireEvent.changeText(screen.getByLabelText('Senha atual'), current);
  fireEvent.changeText(screen.getByLabelText('Nova senha'), next);
  fireEvent.changeText(
    screen.getByLabelText('Confirmar nova senha'),
    confirmation,
  );
}

it('renders accessible mandatory password-change controls', () => {
  render(<ChangePasswordScreen onSubmit={jest.fn()} />);

  expect(screen.getByLabelText('Senha atual')).toBeTruthy();
  expect(screen.getByLabelText('Nova senha')).toBeTruthy();
  expect(screen.getByLabelText('Confirmar nova senha')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Alterar senha' })).toBeTruthy();
});

it('does not submit when confirmation differs', async () => {
  const onSubmit = jest.fn();
  render(<ChangePasswordScreen onSubmit={onSubmit} />);
  fillPasswords({ confirmation: 'outra-senha' });

  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: 'Alterar senha' }));
  });

  expect(onSubmit).not.toHaveBeenCalled();
  expect(
    screen.getByText('A confirmação deve ser igual à nova senha.'),
  ).toBeTruthy();
});

it('blocks duplicate submissions while changing the password', async () => {
  let resolve!: () => void;
  const onSubmit = jest.fn(
    () =>
      new Promise<void>((done) => {
        resolve = done;
      }),
  );
  render(<ChangePasswordScreen onSubmit={onSubmit} />);
  fillPasswords();

  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: 'Alterar senha' }));
  });
  fireEvent.press(screen.getByRole('button', { name: 'Alterar senha' }));

  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Alterar senha' })).toBeDisabled();

  await act(async () => resolve());
});
