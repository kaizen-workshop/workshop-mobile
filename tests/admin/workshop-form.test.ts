import {
  emptyWorkshopForm,
  maskDate,
  maskTime,
  parseDate,
  parsePrice,
  parseTime,
  toWorkshopInput,
  validateWorkshopForm,
  type WorkshopFormValues,
} from '@/admin/workshop-form';

const today = new Date(2026, 8, 1, 10, 0);

const valid: WorkshopFormValues = {
  ...emptyWorkshopForm,
  title: 'Segurança no trabalho',
  description: 'Boas práticas',
  themeId: 'theme-1',
  categoryId: 'category-1',
  date: '11/09/2026',
  startTime: '09:00',
  endTime: '11:00',
  location: 'Auditório',
  maximumParticipants: '30',
  registrationEnd: '10/09/2026',
};

it('masks dates and times while typing', () => {
  expect(maskDate('11092026')).toBe('11/09/2026');
  expect(maskDate('1109')).toBe('11/09');
  expect(maskTime('0930')).toBe('09:30');
});

it('parses only real calendar dates, times and prices', () => {
  expect(parseDate('11/09/2026')).toBe('2026-09-11');
  expect(parseDate('31/02/2026')).toBeNull();
  expect(parseTime('09:30')).toBe('09:30:00');
  expect(parseTime('25:00')).toBeNull();
  expect(parsePrice('25,50')).toBe(25.5);
  expect(parsePrice('')).toBe(0);
  expect(parsePrice('abc')).toBeNull();
});

it('accepts a complete free workshop', () => {
  expect(validateWorkshopForm(valid, today)).toEqual({});
});

it('explains every missing required field', () => {
  const errors = validateWorkshopForm(emptyWorkshopForm, today);
  expect(Object.keys(errors)).toEqual(
    expect.arrayContaining([
      'title',
      'description',
      'themeId',
      'categoryId',
      'date',
      'startTime',
      'endTime',
      'location',
      'maximumParticipants',
      'registrationEnd',
    ]),
  );
});

it('keeps price and payment method consistent', () => {
  expect(
    validateWorkshopForm(
      { ...valid, price: '10', paymentMethod: 'FREE' },
      today,
    ).paymentMethod,
  ).toMatch(/PIX ou cartão/);
  expect(
    validateWorkshopForm({ ...valid, price: '', paymentMethod: 'PIX' }, today)
      .paymentMethod,
  ).toMatch(/gratuita/);
  expect(
    validateWorkshopForm(
      { ...valid, price: '10', paymentMethod: 'PIX' },
      today,
    ),
  ).toEqual({});
});

it('rejects impossible schedules', () => {
  expect(
    validateWorkshopForm({ ...valid, endTime: '08:00' }, today).endTime,
  ).toMatch(/depois do inicial/);
  expect(
    validateWorkshopForm({ ...valid, endDate: '10/09/2026' }, today).endDate,
  ).toMatch(/antes da inicial/);
  expect(
    validateWorkshopForm({ ...valid, date: '31/08/2026' }, today).date,
  ).toMatch(/passado/);
  expect(
    validateWorkshopForm({ ...valid, registrationEnd: '12/09/2026' }, today)
      .registrationEnd,
  ).toMatch(/até o dia do workshop/);
  expect(
    validateWorkshopForm({ ...valid, maximumParticipants: '0' }, today)
      .maximumParticipants,
  ).toMatch(/maior que zero/);
});

it('builds the API payload with ISO dates and a single-day default', () => {
  const input = toWorkshopInput(
    { ...valid, price: '25,50', paymentMethod: 'PIX' },
    new Date('2026-09-01T13:00:00Z'),
  );
  expect(input).toMatchObject({
    startDate: '2026-09-11',
    endDate: '2026-09-11',
    startTime: '09:00:00',
    endTime: '11:00:00',
    price: 25.5,
    paymentMethod: 'PIX',
    maximumParticipants: 30,
    registrationStart: '2026-09-01T13:00:00.000Z',
    additionalInformation: null,
  });
});
