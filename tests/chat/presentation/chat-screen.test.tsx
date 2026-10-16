import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChatScreen } from '@/chat/chat-screen';

const message = (id: string, authorId: string, authorName: string) => ({
  id,
  groupId: 'g1',
  authorId,
  authorName,
  content: `texto de ${authorName}`,
  sentAt: '2026-10-09T10:00:00Z',
  editedAt: null,
  deletedAt: null,
});

function setup(canModerate: boolean) {
  const onDelete = jest.fn();
  render(
    <ChatScreen
      active
      canModerate={canModerate}
      canSendMessages
      currentUserId="me"
      hasMore={false}
      messages={[message('m1', 'me', 'Eu'), message('m2', 'other', 'Outra')]}
      onDelete={onDelete}
      onLoadMore={jest.fn()}
      onRetry={jest.fn()}
      onSend={jest.fn()}
      sending={false}
      status="success"
      title="Grupo"
    />,
  );
  return { onDelete };
}

it('asks for confirmation before deleting and can be cancelled', () => {
  const { onDelete } = setup(false);
  fireEvent.press(screen.getByRole('button', { name: 'Excluir mensagem' }));
  expect(onDelete).not.toHaveBeenCalled();
  expect(screen.getByText('Excluir esta mensagem?')).toBeTruthy();

  fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
  expect(onDelete).not.toHaveBeenCalled();

  fireEvent.press(screen.getByRole('button', { name: 'Excluir mensagem' }));
  fireEvent.press(screen.getByRole('button', { name: 'Sim, excluir' }));
  expect(onDelete).toHaveBeenCalledTimes(1);
});

it('lets only moderators delete other people messages, with a clear warning', () => {
  const { onDelete } = setup(true);
  const buttons = screen.getAllByRole('button', { name: 'Excluir mensagem' });
  expect(buttons).toHaveLength(2);
  fireEvent.press(buttons[1]);
  expect(screen.getByText('Excluir a mensagem de outra pessoa?')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Sim, excluir' }));
  expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'm2' }));
});

it('does not offer deletion of other people messages to regular members', () => {
  setup(false);
  expect(
    screen.getAllByRole('button', { name: 'Excluir mensagem' }),
  ).toHaveLength(1);
});
