import { fireEvent, render, screen } from '@testing-library/react-native';

import { GroupListScreen } from '@/group';

const items = [
  {
    id: 'g1',
    workshopId: 'w1',
    workshopTitle: 'Fundamentos de Lean',
    active: true,
    canSendMessages: true,
    canModerate: false,
    updatedAt: '2026-10-09T10:00:00Z',
  },
  {
    id: 'g2',
    workshopId: 'w2',
    workshopTitle: 'Segurança Industrial',
    active: false,
    canSendMessages: false,
    canModerate: false,
    updatedAt: '2026-10-09T10:00:00Z',
  },
];

function setup(previews = {}) {
  const onOpen = jest.fn();
  render(
    <GroupListScreen
      items={items}
      onOpen={onOpen}
      onRetry={jest.fn()}
      previews={previews}
      status="success"
    />,
  );
  return { onOpen };
}

it('shows the last message and time of each conversation', () => {
  setup({ g1: { author: 'Carla', text: 'Bem-vindos!', time: '09:42' } });
  expect(screen.getByText('Carla: Bem-vindos!')).toBeTruthy();
  expect(screen.getByText('09:42')).toBeTruthy();
});

it('filters conversations by workshop name', () => {
  setup();
  fireEvent.changeText(screen.getByLabelText('Pesquisar conversas'), 'lean');
  expect(screen.getByText('Fundamentos de Lean')).toBeTruthy();
  expect(screen.queryByText('Segurança Industrial')).toBeNull();

  fireEvent.changeText(screen.getByLabelText('Pesquisar conversas'), 'xyz');
  expect(screen.getByText('Nenhuma conversa com esse nome.')).toBeTruthy();
});

it('opens a conversation', () => {
  const { onOpen } = setup();
  fireEvent.press(
    screen.getByRole('button', { name: 'Abrir grupo Fundamentos de Lean' }),
  );
  expect(onOpen).toHaveBeenCalledWith(items[0]);
});
