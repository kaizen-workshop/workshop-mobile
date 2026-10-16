import { fireEvent, render, screen } from '@testing-library/react-native';

import { TaxonomyScreen } from '@/admin';

const categories = [{ id: 'c1', name: 'Palestra' }];

function setup() {
  const onCreate = jest.fn().mockResolvedValue(true);
  const onDeactivate = jest.fn();
  render(
    <TaxonomyScreen
      categories={categories}
      onCreate={onCreate}
      onDeactivate={onDeactivate}
      themes={[]}
    />,
  );
  return { onCreate, onDeactivate };
}

it('asks for confirmation before deactivating an item', () => {
  const { onDeactivate } = setup();
  fireEvent.press(screen.getByRole('button', { name: 'Desativar' }));
  expect(onDeactivate).not.toHaveBeenCalled();
  expect(screen.getByText(/Desativar "Palestra"\?/)).toBeTruthy();

  fireEvent.press(screen.getByRole('button', { name: 'Manter ativo' }));
  expect(onDeactivate).not.toHaveBeenCalled();

  fireEvent.press(screen.getByRole('button', { name: 'Desativar' }));
  fireEvent.press(
    screen.getByRole('button', { name: 'Confirmar desativação' }),
  );
  expect(onDeactivate).toHaveBeenCalledWith('categories', categories[0]);
});

it('validates the name before creating', () => {
  const { onCreate } = setup();
  fireEvent.press(screen.getByRole('button', { name: 'Adicionar categoria' }));
  expect(screen.getByText('Informe o nome da categoria.')).toBeTruthy();
  expect(onCreate).not.toHaveBeenCalled();

  fireEvent.changeText(screen.getByLabelText('Nome da categoria'), 'palestra');
  fireEvent.press(screen.getByRole('button', { name: 'Adicionar categoria' }));
  expect(screen.getByText(/Já existe uma categoria/)).toBeTruthy();
});
