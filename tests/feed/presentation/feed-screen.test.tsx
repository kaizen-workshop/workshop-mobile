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

  const headers = screen
    .getAllByRole('header')
    .map((node) => node.props.children);
  expect(headers).toEqual([
    'Feed',
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
