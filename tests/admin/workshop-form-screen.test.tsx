import { fireEvent, render, screen } from '@testing-library/react-native';

import { WorkshopFormScreen } from '@/admin';

function setup() {
  render(
    <WorkshopFormScreen
      categories={[]}
      heading="Novo workshop"
      onCancel={jest.fn()}
      onSubmit={jest.fn()}
      submitLabel="Criar"
      subtitle="Preencha os dados"
      themes={[]}
    />,
  );
}

const payment = (name: string) => screen.getByRole('radio', { name });

it('locks "Gratuito" and switches to PIX when a price is typed', () => {
  setup();
  expect(payment('Gratuito').props.accessibilityState).toMatchObject({
    checked: true,
  });

  fireEvent.changeText(screen.getByLabelText('Valor (R$)'), '30');

  expect(payment('Gratuito').props.accessibilityState).toMatchObject({
    checked: false,
    disabled: true,
  });
  expect(payment('PIX').props.accessibilityState).toMatchObject({
    checked: true,
  });
});

it('returns to "Gratuito" and unlocks it when the price is cleared', () => {
  setup();
  const price = screen.getByLabelText('Valor (R$)');
  fireEvent.changeText(price, '30');
  fireEvent.changeText(price, '');

  expect(payment('Gratuito').props.accessibilityState).toMatchObject({
    checked: true,
  });
  expect(payment('Gratuito').props.accessibilityState.disabled).toBeFalsy();
});

it('keeps the card choice while the price changes', () => {
  setup();
  const price = screen.getByLabelText('Valor (R$)');
  fireEvent.changeText(price, '30');
  fireEvent.press(payment('Cartão'));
  fireEvent.changeText(price, '45');

  expect(payment('Cartão').props.accessibilityState).toMatchObject({
    checked: true,
  });
});
