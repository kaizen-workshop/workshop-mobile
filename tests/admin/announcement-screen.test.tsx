import { fireEvent, render, screen } from '@testing-library/react-native';

import { AnnouncementScreen, validateAnnouncement } from '@/admin';

const workshops = [{ id: 'w1', title: 'Lean' }];

function setup(props = {}) {
  const onSend = jest.fn();
  const onSelectWorkshop = jest.fn();
  render(
    <AnnouncementScreen
      busy={false}
      onCancel={jest.fn()}
      onSelectWorkshop={onSelectWorkshop}
      onSend={onSend}
      recipients={2}
      selectedWorkshopId="w1"
      workshops={workshops}
      {...props}
    />,
  );
  return { onSend, onSelectWorkshop };
}

it('validates title and message limits', () => {
  expect(validateAnnouncement({ title: '', message: '' })).toEqual({
    title: 'Informe um título.',
    message: 'Escreva a mensagem.',
  });
  expect(
    validateAnnouncement({ title: 'x'.repeat(161), message: 'ok' }).title,
  ).toMatch(/160/);
});

it('says how many people will be notified and sends a valid announcement', () => {
  const { onSend } = setup();
  expect(screen.getByText('2 pessoas receberão este comunicado.')).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText('Título'), 'Aviso');
  fireEvent.changeText(screen.getByLabelText('Mensagem'), 'Traga o notebook.');
  fireEvent.press(screen.getByRole('button', { name: 'Enviar comunicado' }));
  expect(onSend).toHaveBeenCalledWith({
    title: 'Aviso',
    message: 'Traga o notebook.',
  });
});

it('blocks sending when nobody would receive it', () => {
  const { onSend } = setup({ recipients: 0 });
  expect(screen.getByText(/ainda não tem inscritos confirmados/)).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText('Título'), 'Aviso');
  fireEvent.changeText(screen.getByLabelText('Mensagem'), 'Texto');
  fireEvent.press(screen.getByRole('button', { name: 'Enviar comunicado' }));
  expect(onSend).not.toHaveBeenCalled();
});

it('asks for a workshop first', () => {
  const { onSend } = setup({
    selectedWorkshopId: undefined,
    recipients: undefined,
  });
  fireEvent.changeText(screen.getByLabelText('Título'), 'Aviso');
  fireEvent.changeText(screen.getByLabelText('Mensagem'), 'Texto');
  fireEvent.press(screen.getByRole('button', { name: 'Enviar comunicado' }));
  expect(screen.getByText('Escolha o workshop.')).toBeTruthy();
  expect(onSend).not.toHaveBeenCalled();
});
