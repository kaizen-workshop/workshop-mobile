import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { PreferencesScreen } from '@/preferences/presentation';

const themes = [
  { id: 'lean', name: 'Lean', description: 'Melhoria de processos' },
  { id: 'quality', name: 'Qualidade' },
] as const;

function SelectionHarness({
  onSubmit = jest.fn(),
}: {
  onSubmit?: (ids: readonly string[]) => Promise<void> | void;
}) {
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  return (
    <PreferencesScreen
      onSubmit={onSubmit}
      onToggle={(themeId) => {
        setSelectedIds((current) => {
          const next = new Set(current);
          if (next.has(themeId)) next.delete(themeId);
          else next.add(themeId);
          return next;
        });
      }}
      selectedIds={selectedIds}
      status="success"
      themes={themes}
    />
  );
}

it('renders loading, error and empty states', () => {
  const { rerender } = render(
    <PreferencesScreen
      onSubmit={jest.fn()}
      onToggle={jest.fn()}
      selectedIds={new Set()}
      status="loading"
      themes={[]}
    />,
  );
  expect(screen.getByLabelText('Carregando temas')).toBeTruthy();

  rerender(
    <PreferencesScreen
      onRetry={jest.fn()}
      onSubmit={jest.fn()}
      onToggle={jest.fn()}
      selectedIds={new Set()}
      status="error"
      themes={[]}
    />,
  );
  expect(screen.getByText('Não foi possível carregar os temas.')).toBeTruthy();

  rerender(
    <PreferencesScreen
      onSubmit={jest.fn()}
      onToggle={jest.fn()}
      selectedIds={new Set()}
      status="success"
      themes={[]}
    />,
  );
  expect(screen.getByText('Nenhum tema disponível')).toBeTruthy();
});

it('allows multiple selection and submits only selected theme ids', async () => {
  const onSubmit = jest.fn();
  render(<SelectionHarness onSubmit={onSubmit} />);

  fireEvent.press(screen.getByRole('checkbox', { name: 'Lean' }));
  fireEvent.press(screen.getByRole('checkbox', { name: 'Qualidade' }));
  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
  });

  expect(onSubmit).toHaveBeenCalledWith(['lean', 'quality']);
});

it('passes the source collection directly to the virtualized list', () => {
  render(<SelectionHarness />);

  expect(screen.getByTestId('preferences-list').props.data).toBe(themes);
});

it('shows a safe save error and leaves retry available', async () => {
  render(
    <SelectionHarness
      onSubmit={jest.fn().mockRejectedValue(new Error('technical detail'))}
    />,
  );

  fireEvent.press(screen.getByRole('checkbox', { name: 'Lean' }));
  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
  });

  expect(
    await screen.findByText('Não foi possível salvar suas preferências.'),
  ).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
});
