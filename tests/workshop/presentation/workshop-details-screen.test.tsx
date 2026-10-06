import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Alert } from 'react-native';

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

it('shows attachment progress and opening errors', () => {
  const { rerender } = render(
    <WorkshopDetailsScreen
      onOpenAttachment={jest.fn()}
      openingAttachmentId="attachment-1"
      status="success"
      workshop={workshop}
    />,
  );

  expect(
    screen.getByLabelText('Abrindo anexo Material de apoio.pdf'),
  ).toBeTruthy();
  expect(
    screen.getByRole('button', { name: 'Abrir anexo Material de apoio.pdf' })
      .props.accessibilityState,
  ).toMatchObject({ busy: true, disabled: true });

  rerender(
    <WorkshopDetailsScreen
      attachmentError
      onOpenAttachment={jest.fn()}
      status="success"
      workshop={workshop}
    />,
  );
  expect(
    screen.getByText('Não foi possível abrir o anexo. Tente novamente.'),
  ).toBeTruthy();
});

it('submits a registration once and exposes loading feedback', () => {
  const onRegister = jest.fn();
  const { rerender } = render(
    <WorkshopDetailsScreen
      onRegister={onRegister}
      status="success"
      workshop={workshop}
    />,
  );

  fireEvent.press(screen.getByRole('button', { name: 'Inscrever-se' }));
  expect(onRegister).toHaveBeenCalledTimes(1);

  rerender(
    <WorkshopDetailsScreen
      onRegister={onRegister}
      registering
      status="success"
      workshop={workshop}
    />,
  );
  const button = screen.getByRole('button');
  fireEvent.press(button);
  expect(button.props.accessibilityState).toMatchObject({
    busy: true,
    disabled: true,
  });
  expect(screen.getByLabelText('Realizando inscrição')).toBeTruthy();
  expect(onRegister).toHaveBeenCalledTimes(1);
});

it('shows registration success, waiting list and conflict outcomes', () => {
  const { rerender } = render(
    <WorkshopDetailsScreen
      registration={{
        id: 'registration-1',
        workshopId: workshop.id,
        status: 'CONFIRMED',
        paymentStatus: 'EXEMPT',
      }}
      status="success"
      workshop={workshop}
    />,
  );
  expect(screen.getByText('Inscrição confirmada')).toBeTruthy();
  expect(screen.getByText('Sua participação está confirmada.')).toBeTruthy();

  rerender(
    <WorkshopDetailsScreen
      registration={{
        id: 'registration-2',
        workshopId: workshop.id,
        status: 'WAITING_LIST',
        paymentStatus: 'EXEMPT',
        waitingListPosition: 3,
      }}
      status="success"
      workshop={workshop}
    />,
  );
  expect(screen.getByText('Você entrou na lista de espera')).toBeTruthy();
  expect(
    screen.getByText(
      'O workshop está cheio. Sua posição na lista é 3. Você será avisado se surgir uma vaga.',
    ),
  ).toBeTruthy();

  rerender(
    <WorkshopDetailsScreen
      onRegister={jest.fn()}
      registrationError="conflict"
      status="success"
      workshop={workshop}
    />,
  );
  expect(
    screen.getByText(
      'Você já possui uma inscrição válida ou este workshop não aceita novas inscrições.',
    ),
  ).toBeTruthy();
});

it('confirms cancellation before invoking the action', () => {
  const onCancelRegistration = jest.fn();
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  render(
    <WorkshopDetailsScreen
      onCancelRegistration={onCancelRegistration}
      registration={{
        id: 'registration-1',
        workshopId: workshop.id,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
      }}
      status="success"
      workshop={workshop}
    />,
  );

  fireEvent.press(screen.getByRole('button', { name: 'Cancelar inscrição' }));
  expect(onCancelRegistration).not.toHaveBeenCalled();
  expect(alert).toHaveBeenCalledWith(
    'Cancelar inscrição',
    'Tem certeza de que deseja cancelar esta inscrição?',
    expect.any(Array),
  );
  const actions = alert.mock.calls[0][2];
  actions?.[1]?.onPress?.();
  expect(onCancelRegistration).toHaveBeenCalledTimes(1);
  alert.mockRestore();
});

it('explains cancellation refund outcomes and allows a new registration', () => {
  const onRegister = jest.fn();
  const { rerender } = render(
    <WorkshopDetailsScreen
      onRegister={onRegister}
      registration={{
        id: 'registration-1',
        workshopId: workshop.id,
        status: 'CANCELLED',
        paymentStatus: 'PAID',
      }}
      status="success"
      workshop={workshop}
    />,
  );
  expect(
    screen.getByText(
      'A inscrição foi cancelada, mas o pagamento não foi reembolsado conforme a regra de prazo.',
    ),
  ).toBeTruthy();
  fireEvent.press(
    screen.getByRole('button', { name: 'Inscrever-se novamente' }),
  );
  expect(onRegister).toHaveBeenCalledTimes(1);

  rerender(
    <WorkshopDetailsScreen
      registration={{
        id: 'registration-1',
        workshopId: workshop.id,
        status: 'REFUNDED',
        paymentStatus: 'REFUNDED',
      }}
      status="success"
      workshop={workshop}
    />,
  );
  expect(
    screen.getByText('A inscrição foi cancelada e o reembolso foi processado.'),
  ).toBeTruthy();
});

it('starts payment only for a pending paid registration and shows its state', () => {
  const onCreatePayment = jest.fn();
  const pendingRegistration = {
    id: 'registration-1',
    workshopId: workshop.id,
    status: 'PENDING' as const,
    paymentStatus: 'PENDING' as const,
  };
  const { rerender } = render(
    <WorkshopDetailsScreen
      onCreatePayment={onCreatePayment}
      registration={pendingRegistration}
      status="success"
      workshop={workshop}
    />,
  );

  fireEvent.press(screen.getByRole('button', { name: 'Iniciar pagamento' }));
  expect(onCreatePayment).toHaveBeenCalledTimes(1);

  rerender(
    <WorkshopDetailsScreen
      onCreatePayment={onCreatePayment}
      paying
      registration={pendingRegistration}
      status="success"
      workshop={workshop}
    />,
  );
  expect(screen.getByLabelText('Iniciando pagamento')).toBeTruthy();

  rerender(
    <WorkshopDetailsScreen
      payment={{
        id: 'payment-1',
        registrationId: 'registration-1',
        amount: 150,
        status: 'PENDING',
        method: 'PIX',
      }}
      registration={pendingRegistration}
      status="success"
      workshop={workshop}
    />,
  );
  expect(screen.getByText('Pagamento pendente')).toBeTruthy();
  expect(
    screen.getByText('A solicitação foi criada e aguarda confirmação.'),
  ).toBeTruthy();
  expect(screen.queryByText('simulated-reference')).toBeNull();
});

it('shows workshop comments in the detail scroll and publishes a new comment', async () => {
  const onSendComment = jest.fn().mockResolvedValue(true);
  render(
    <WorkshopDetailsScreen
      comments={[
        {
          id: 'comment-1',
          userId: 'user-1',
          content: 'Ótimo conteúdo e exemplos práticos.',
          createdAt: '2026-10-02T12:00:00Z',
          updatedAt: '2026-10-02T12:00:00Z',
        },
      ]}
      currentUserId="user-1"
      discussionStatus="success"
      onSendComment={onSendComment}
      status="success"
      workshop={workshop}
    />,
  );

  expect(screen.getByText('Comentários')).toBeTruthy();
  expect(screen.getByText('Você')).toBeTruthy();
  expect(screen.getByText('Ótimo conteúdo e exemplos práticos.')).toBeTruthy();

  fireEvent.changeText(
    screen.getByLabelText('Novo comentário'),
    'Quero participar novamente.',
  );
  fireEvent.press(screen.getByRole('button', { name: 'Publicar' }));

  await waitFor(() =>
    expect(onSendComment).toHaveBeenCalledWith('Quero participar novamente.'),
  );
  await waitFor(() =>
    expect(screen.getByLabelText('Novo comentário').props.value).toBe(''),
  );
});
