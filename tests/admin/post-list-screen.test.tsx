import { fireEvent, render, screen } from '@testing-library/react-native';

import { PostListScreen, type ManagedPost } from '@/admin';

const draft: ManagedPost = {
  id: 'p1',
  title: 'Rascunho de aviso',
  content: 'Conteúdo do rascunho',
  status: 'DRAFT',
  highlight: false,
};
const published: ManagedPost = {
  id: 'p2',
  title: 'Post no ar',
  content: 'Conteúdo publicado',
  status: 'PUBLISHED',
  highlight: true,
};

function setup() {
  const handlers = {
    onArchive: jest.fn(),
    onCreate: jest.fn(),
    onEdit: jest.fn(),
    onPublish: jest.fn(),
    onRetry: jest.fn(),
    onSchedule: jest.fn(),
  };
  render(
    <PostListScreen
      posts={[draft, published]}
      status="success"
      {...handlers}
    />,
  );
  return handlers;
}

it('offers the actions each status allows', () => {
  setup();
  expect(screen.getByText('Rascunho')).toBeTruthy();
  expect(screen.getByText('Publicado')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Publicar agora' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Editar' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Agendar' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Arquivar' })).toBeTruthy();
});

it('publishes and edits a draft', () => {
  const { onPublish, onEdit } = setup();
  fireEvent.press(screen.getByRole('button', { name: 'Publicar agora' }));
  fireEvent.press(screen.getByRole('button', { name: 'Editar' }));
  expect(onPublish).toHaveBeenCalledWith(draft);
  expect(onEdit).toHaveBeenCalledWith(draft);
});

it('confirms before archiving a published post', () => {
  const { onArchive } = setup();
  fireEvent.press(screen.getByRole('button', { name: 'Arquivar' }));
  expect(onArchive).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Manter publicado' }));
  fireEvent.press(screen.getByRole('button', { name: 'Arquivar' }));
  fireEvent.press(
    screen.getByRole('button', { name: 'Confirmar arquivamento' }),
  );
  expect(onArchive).toHaveBeenCalledWith(published);
});

it('rejects a past schedule and accepts a future one', () => {
  const { onSchedule } = setup();
  fireEvent.press(screen.getByRole('button', { name: 'Agendar' }));
  fireEvent.changeText(screen.getByLabelText('Data da publicação'), '01012020');
  fireEvent.changeText(screen.getByLabelText('Horário'), '0900');
  fireEvent.press(
    screen.getByRole('button', { name: 'Confirmar agendamento' }),
  );
  expect(screen.getByText(/no futuro/)).toBeTruthy();
  expect(onSchedule).not.toHaveBeenCalled();

  fireEvent.changeText(screen.getByLabelText('Data da publicação'), '01012099');
  fireEvent.press(
    screen.getByRole('button', { name: 'Confirmar agendamento' }),
  );
  expect(onSchedule).toHaveBeenCalledWith(
    draft,
    expect.stringMatching(/^2099-/),
  );
});
