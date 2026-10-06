import { fireEvent, render, screen } from '@testing-library/react-native';

import { WorkshopListScreen } from '@/workshop/presentation';

const workshops = [
  {
    id: 'one',
    title: 'Lean Manufacturing',
    theme: 'Excelência operacional',
    scheduleLabel: '10 de outubro, 9h',
  },
  {
    id: 'two',
    title: 'Qualidade na prática',
  },
];

it('renders loading, error and empty states', () => {
  const { rerender } = render(
    <WorkshopListScreen
      onRefresh={jest.fn()}
      status="loading"
      workshops={[]}
    />,
  );
  expect(screen.getByLabelText('Carregando workshops')).toBeTruthy();

  rerender(
    <WorkshopListScreen onRefresh={jest.fn()} status="error" workshops={[]} />,
  );
  expect(
    screen.getByText('Não foi possível carregar os workshops.'),
  ).toBeTruthy();

  rerender(
    <WorkshopListScreen
      onRefresh={jest.fn()}
      status="success"
      workshops={[]}
    />,
  );
  expect(screen.getByText('Nenhum workshop encontrado')).toBeTruthy();
});

it('preserves workshop order and tolerates optional fields', () => {
  render(
    <WorkshopListScreen
      onRefresh={jest.fn()}
      status="success"
      workshops={workshops}
    />,
  );

  expect(screen.getByTestId('workshop-list').props.data).toBe(workshops);
  const headers = screen
    .getAllByRole('header')
    .map((node) => node.props.children);
  expect(headers).toEqual([
    'Workshops',
    'Lean Manufacturing',
    'Qualidade na prática',
  ]);
  expect(screen.queryByText('undefined')).toBeNull();
  expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeTruthy();
});

it('opens workshops and connects pull-to-refresh', () => {
  const onOpen = jest.fn();
  const onRefresh = jest.fn();
  render(
    <WorkshopListScreen
      onOpen={onOpen}
      onRefresh={onRefresh}
      status="success"
      workshops={workshops}
    />,
  );

  fireEvent.press(
    screen.getByRole('button', { name: 'Abrir workshop Lean Manufacturing' }),
  );
  screen.getByTestId('workshop-list').props.refreshControl.props.onRefresh();

  expect(onOpen).toHaveBeenCalledWith(workshops[0]);
  expect(onRefresh).toHaveBeenCalledTimes(1);
});

it('identifies workshops loaded from the offline cache', () => {
  render(
    <WorkshopListScreen
      onRefresh={jest.fn()}
      source="cache"
      status="error"
      workshops={workshops}
    />,
  );

  expect(
    screen.getByText(
      'Sem conexão. Exibindo workshops salvos neste dispositivo.',
    ),
  ).toBeTruthy();
  expect(screen.getByText('Lean Manufacturing')).toBeTruthy();
});

it('applies status, theme and category filters', () => {
  const onFiltersChange = jest.fn();
  const props = {
    filters: { status: 'PUBLISHED' as const },
    filterOptions: {
      themes: [{ id: 'theme-1', name: 'Lean' }],
      categories: [{ id: 'category-1', name: 'Indústria' }],
    },
    onFiltersChange,
    onRefresh: jest.fn(),
    status: 'success' as const,
    workshops,
  };
  const { rerender } = render(<WorkshopListScreen {...props} />);

  fireEvent.press(screen.getByRole('button', { name: 'Mostrar filtros' }));
  fireEvent.press(screen.getByRole('button', { name: 'Filtrar por Lean' }));
  expect(onFiltersChange).toHaveBeenLastCalledWith({
    status: 'PUBLISHED',
    themeId: 'theme-1',
  });

  rerender(
    <WorkshopListScreen
      {...props}
      filters={{ status: 'PUBLISHED', themeId: 'theme-1' }}
    />,
  );
  fireEvent.press(
    screen.getByRole('button', { name: 'Filtrar por Indústria' }),
  );
  expect(onFiltersChange).toHaveBeenLastCalledWith({
    status: 'PUBLISHED',
    themeId: 'theme-1',
    categoryId: 'category-1',
  });

  fireEvent.press(
    screen.getByRole('button', { name: 'Filtrar por Encerrado' }),
  );
  expect(onFiltersChange).toHaveBeenLastCalledWith({
    status: 'CLOSED',
    themeId: 'theme-1',
  });
});

it('keeps filters available when no workshop matches', () => {
  render(
    <WorkshopListScreen
      filterOptions={{ themes: [], categories: [] }}
      filters={{ status: 'CLOSED' }}
      onFiltersChange={jest.fn()}
      onRefresh={jest.fn()}
      status="success"
      workshops={[]}
    />,
  );

  expect(screen.getByText('Nenhum workshop encontrado')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Mostrar filtros' }));
  expect(
    screen.getByRole('button', { name: 'Filtrar por Publicado' }),
  ).toBeTruthy();
});
