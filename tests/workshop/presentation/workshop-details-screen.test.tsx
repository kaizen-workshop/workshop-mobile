import { fireEvent, render, screen } from '@testing-library/react-native';

import { WorkshopDetailsScreen } from '@/workshop/presentation';

const workshop = {
  id: 'workshop-1',
  title: 'Lean Manufacturing',
  imageUrl: 'https://example.test/lean.png',
  description: 'Práticas para melhoria contínua.',
  theme: 'Excelência operacional',
  category: 'Indústria',
  dateLabel: '10 de outubro',
  timeLabel: '9h às 12h',
  location: 'Auditório central',
  modality: 'Presencial',
  priceLabel: 'Gratuito',
  registrationPeriodLabel: 'Até 8 de outubro',
  capacityLabel: '20 vagas',
  responsibleNames: ['Ana Souza'],
  attachments: [{ id: 'attachment-1', name: 'Material de apoio.pdf' }],
  additionalInformation: 'Leve seu crachá.',
};

it('renders loading and error states', () => {
  const { rerender } = render(<WorkshopDetailsScreen status="loading" />);
  expect(screen.getByLabelText('Carregando workshop')).toBeTruthy();

  rerender(<WorkshopDetailsScreen status="error" />);
  expect(
    screen.getByText('Não foi possível carregar o workshop.'),
  ).toBeTruthy();
});

it('renders every available workshop detail', () => {
  render(<WorkshopDetailsScreen status="success" workshop={workshop} />);

  expect(screen.getByText('Lean Manufacturing')).toBeTruthy();
  expect(screen.getByText('Práticas para melhoria contínua.')).toBeTruthy();
  expect(screen.getByText('Excelência operacional')).toBeTruthy();
  expect(screen.getByText('Ana Souza')).toBeTruthy();
  expect(screen.getByText('Material de apoio.pdf')).toBeTruthy();
  expect(screen.getByText('Leve seu crachá.')).toBeTruthy();
  expect(
    screen.getByLabelText('Imagem do workshop Lean Manufacturing'),
  ).toBeTruthy();
  expect(screen.queryByRole('button')).toBeNull();
});

it('omits unavailable optional sections', () => {
  render(
    <WorkshopDetailsScreen
      status="success"
      workshop={{ id: 'minimal', title: 'Workshop mínimo' }}
    />,
  );

  expect(screen.getByText('Workshop mínimo')).toBeTruthy();
  expect(screen.queryByText('Responsáveis')).toBeNull();
  expect(screen.queryByText('Anexos')).toBeNull();
  expect(screen.queryByText('Informações adicionais')).toBeNull();
});

it('opens an available attachment through the injected action', () => {
  const onOpenAttachment = jest.fn();
  render(
    <WorkshopDetailsScreen
      onOpenAttachment={onOpenAttachment}
      status="success"
      workshop={workshop}
    />,
  );

  fireEvent.press(
    screen.getByRole('button', {
      name: 'Abrir anexo Material de apoio.pdf',
    }),
  );

  expect(onOpenAttachment).toHaveBeenCalledWith(workshop.attachments[0]);
});

it('keeps saved details visible after a network error', () => {
  render(
    <WorkshopDetailsScreen source="cache" status="error" workshop={workshop} />,
  );

  expect(
    screen.getByText(
      'Sem conexão. Exibindo os detalhes salvos neste dispositivo.',
    ),
  ).toBeTruthy();
  expect(screen.getByText('Lean Manufacturing')).toBeTruthy();
});
