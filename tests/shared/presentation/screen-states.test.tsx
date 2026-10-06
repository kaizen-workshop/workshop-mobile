import { fireEvent, render, screen } from '@testing-library/react-native';

import {
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineState,
} from '@/shared/presentation';

it('announces loading progress', () => {
  render(<LoadingState message="Carregando workshops" />);

  expect(screen.getByLabelText('Carregando workshops')).toBeTruthy();
});

it('offers retry from an error state', () => {
  const onRetry = jest.fn();
  render(<ErrorState onRetry={onRetry} />);

  fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));

  expect(screen.getByText('Algo deu errado')).toBeTruthy();
  expect(onRetry).toHaveBeenCalledTimes(1);
});

it('renders an empty state without requiring an action', () => {
  render(<EmptyState title="Nenhum workshop encontrado" />);

  expect(screen.getByText('Nenhum workshop encontrado')).toBeTruthy();
});

it.each([
  [true, 'Exibindo os dados salvos neste dispositivo.'],
  [false, 'ainda não há dados salvos para exibir.'],
])('describes offline cache availability', (hasCachedContent, message) => {
  render(<OfflineState hasCachedContent={hasCachedContent} />);

  expect(screen.getByText(new RegExp(message))).toBeTruthy();
});

it('offers an explicit retry while offline', () => {
  const onRetry = jest.fn();
  render(<OfflineState onRetry={onRetry} />);

  fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));

  expect(onRetry).toHaveBeenCalledTimes(1);
});
