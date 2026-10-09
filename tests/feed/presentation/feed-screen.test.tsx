import { fireEvent, render, screen } from '@testing-library/react-native';

import { FeedScreen } from '@/feed/presentation';

const items = [
  {
    id: 'workshop-1',
    kind: 'workshop' as const,
    title: 'Lean Manufacturing',
    highlighted: true,
  },
  {
    id: 'post-1',
    kind: 'post' as const,
    title: 'Novidades da semana',
  },
];

const baseProps = {
  items,
  onRefresh: jest.fn(),
  status: 'success' as const,
};

it('renders loading, error and empty states', () => {
  const { rerender } = render(
    <FeedScreen items={[]} onRefresh={jest.fn()} status="loading" />,
  );
  expect(screen.getByLabelText('Carregando feed')).toBeTruthy();

  rerender(<FeedScreen items={[]} onRefresh={jest.fn()} status="error" />);
  expect(screen.getByText('Não foi possível carregar o feed.')).toBeTruthy();

  rerender(<FeedScreen items={[]} onRefresh={jest.fn()} status="success" />);
  expect(screen.getByText('Seu feed está vazio')).toBeTruthy();
});

it('preserves item order and identifies highlighted content', () => {
  render(<FeedScreen {...baseProps} />);

  expect(screen.getByTestId('feed-list').props.data).toBe(items);
  const headers = screen
    .getAllByRole('header')
    .map((node) => node.props.children);
  expect(headers).toEqual([
    'Feed',
    'Seu próximo aprendizado',
    'Lean Manufacturing',
    'Novidades da semana',
  ]);
  expect(screen.getByLabelText('Destaque')).toBeTruthy();
});

it('opens a selected item', () => {
  const onItemPress = jest.fn();
  render(<FeedScreen {...baseProps} onItemPress={onItemPress} />);

  fireEvent.press(
    screen.getByRole('button', { name: 'Abrir Lean Manufacturing' }),
  );

  expect(onItemPress).toHaveBeenCalledWith(items[0]);
});

it('connects refresh and incremental loading callbacks', () => {
  const onRefresh = jest.fn();
  const onLoadMore = jest.fn();
  render(
    <FeedScreen {...baseProps} onLoadMore={onLoadMore} onRefresh={onRefresh} />,
  );
  const list = screen.getByTestId('feed-list');

  list.props.refreshControl.props.onRefresh();
  list.props.onEndReached();

  expect(onRefresh).toHaveBeenCalledTimes(1);
  expect(onLoadMore).toHaveBeenCalledTimes(1);
});

it('identifies content loaded from the offline cache', () => {
  render(<FeedScreen {...baseProps} source="cache" status="error" />);

  expect(
    screen.getByText('Sem conexão. Exibindo conteúdo salvo neste dispositivo.'),
  ).toBeTruthy();
  expect(screen.getByText('Lean Manufacturing')).toBeTruthy();
});

it('offers retry when incremental loading fails', () => {
  const onLoadMore = jest.fn();
  render(<FeedScreen {...baseProps} loadMoreError onLoadMore={onLoadMore} />);

  fireEvent.press(
    screen.getByRole('button', {
      name: 'Não foi possível carregar mais. Tentar novamente',
    }),
  );

  expect(onLoadMore).toHaveBeenCalledTimes(1);
});

it('does not start another page while incremental loading is active', () => {
  const onLoadMore = jest.fn();
  render(<FeedScreen {...baseProps} loadingMore onLoadMore={onLoadMore} />);

  expect(screen.getByTestId('feed-list').props.onEndReached).toBeUndefined();
  expect(onLoadMore).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Carregando mais itens')).toBeTruthy();
});

it('reports the selected post when the like action is pressed', () => {
  const onToggleLike = jest.fn();
  render(<FeedScreen {...baseProps} onToggleLike={onToggleLike} />);

  fireEvent.press(screen.getByRole('button', { name: 'Curtir' }));

  expect(onToggleLike).toHaveBeenCalledWith(items[1]);
});

it('filters the loaded items by search text and by kind', () => {
  render(<FeedScreen {...baseProps} />);

  fireEvent.changeText(screen.getByLabelText('Pesquisar no feed'), 'novidades');
  expect(screen.queryByText('Lean Manufacturing')).toBeNull();
  expect(screen.getByText('Novidades da semana')).toBeTruthy();

  fireEvent.changeText(screen.getByLabelText('Pesquisar no feed'), 'xyz');
  expect(screen.getByText(/Nada encontrado/)).toBeTruthy();

  fireEvent.changeText(screen.getByLabelText('Pesquisar no feed'), '');
  fireEvent.press(screen.getByRole('button', { name: 'Workshops' }));
  expect(screen.getByText('Lean Manufacturing')).toBeTruthy();
  expect(screen.queryByText('Novidades da semana')).toBeNull();
});

it('never shows a raw ISO timestamp as post context', () => {
  render(
    <FeedScreen
      {...baseProps}
      items={[
        {
          id: 'post-2',
          kind: 'post' as const,
          title: 'Semana da Segurança',
          context: '2026-10-08T10:43:28.645298Z',
        },
      ]}
    />,
  );

  expect(screen.queryByText(/T10:43/)).toBeNull();
  expect(screen.getByText(/Publicado em/)).toBeTruthy();
});
