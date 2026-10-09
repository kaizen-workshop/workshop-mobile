import { fireEvent, render, screen } from '@testing-library/react-native';

import { MediaScreen } from '@/admin';

const attachments = [
  {
    id: 'a1',
    filename: 'regulamento.png',
    contentType: 'image/png',
    sizeBytes: 2048,
  },
];

function setup(props = {}) {
  const handlers = {
    onAddAttachment: jest.fn(),
    onChooseImage: jest.fn(),
    onDeleteAttachment: jest.fn(),
    onRemoveImage: jest.fn(),
  };
  render(
    <MediaScreen
      attachments={attachments}
      busy={false}
      title="Workshop Futebol"
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

it('explains the fallback cover and offers to choose an image', () => {
  const { onChooseImage } = setup();
  expect(screen.getByText(/capa gerada pelo tema/)).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Escolher imagem' }));
  expect(onChooseImage).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('button', { name: 'Remover imagem' })).toBeNull();
});

it('lists attachments with their size and the accepted formats', () => {
  setup();
  expect(screen.getByText('regulamento.png')).toBeTruthy();
  expect(screen.getByText('2 KB')).toBeTruthy();
  expect(screen.getAllByText(/até 10 MB/).length).toBeGreaterThan(0);
});

it('confirms before deleting an attachment', () => {
  const { onDeleteAttachment } = setup();
  fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
  expect(onDeleteAttachment).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Manter anexo' }));
  expect(screen.queryByText(/Excluir "regulamento.png"/)).toBeNull();

  fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar exclusão' }));
  expect(onDeleteAttachment).toHaveBeenCalledWith(attachments[0]);
});

it('confirms before removing the cover image', () => {
  const { onRemoveImage } = setup({ imageUrl: 'http://x/image' });
  expect(screen.getByRole('button', { name: 'Trocar imagem' })).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Remover imagem' }));
  expect(onRemoveImage).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar remoção' }));
  expect(onRemoveImage).toHaveBeenCalledTimes(1);
});
