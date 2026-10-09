import type {
  ManagedWorkshop,
  PaymentMethod,
  WorkshopInput,
  WorkshopModality,
} from './admin';

/** Everything the form edits, as the strings people type. */
export type WorkshopFormValues = {
  title: string;
  description: string;
  themeId: string;
  categoryId: string;
  /** DD/MM/AAAA */
  date: string;
  /** DD/MM/AAAA, empty means a single-day workshop */
  endDate: string;
  /** HH:MM */
  startTime: string;
  endTime: string;
  location: string;
  maximumParticipants: string;
  modality: WorkshopModality;
  /** "25,50" or "25.50"; empty means free */
  price: string;
  paymentMethod: PaymentMethod;
  /** DD/MM/AAAA: last day to register */
  registrationEnd: string;
  additionalInformation: string;
};

export type WorkshopFormErrors = Partial<
  Record<keyof WorkshopFormValues, string>
>;

export const emptyWorkshopForm: WorkshopFormValues = {
  title: '',
  description: '',
  themeId: '',
  categoryId: '',
  date: '',
  endDate: '',
  startTime: '',
  endTime: '',
  location: '',
  maximumParticipants: '',
  modality: 'IN_PERSON',
  price: '',
  paymentMethod: 'FREE',
  registrationEnd: '',
  additionalInformation: '',
};

/** Inserts the slashes while the person types: 11092026 -> 11/09/2026. */
export function maskDate(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Inserts the colon while the person types: 0930 -> 09:30. */
export function maskTime(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length <= 2
    ? digits
    : `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/** "11/09/2026" -> "2026-09-11", or null if it is not a real calendar date. */
export function parseDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const valid =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);
  return valid ? `${year}-${month}-${day}` : null;
}

export function formatDate(isoDate: string) {
  return isoDate.split('-').reverse().join('/');
}

/** "09:30" -> "09:30:00", or null when the time does not exist. */
export function parseTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, hours, minutes] = match;
  return Number(hours) < 24 && Number(minutes) < 60
    ? `${hours}:${minutes}:00`
    : null;
}

export function parsePrice(value: string) {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) return 0;
  return /^\d+(\.\d{1,2})?$/.test(normalized) ? Number(normalized) : null;
}

/** Local end of day as an ISO instant, so "até 15/09" includes the 15th. */
function endOfDayInstant(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day, 23, 59, 0).toISOString();
}

export function validateWorkshopForm(
  values: WorkshopFormValues,
  today = new Date(),
): WorkshopFormErrors {
  const errors: WorkshopFormErrors = {};
  const required = 'Preencha este campo.';

  if (!values.title.trim()) errors.title = required;
  else if (values.title.trim().length > 180)
    errors.title = 'Use no máximo 180 caracteres.';
  if (!values.description.trim()) errors.description = required;
  if (!values.themeId) errors.themeId = 'Escolha um tema.';
  if (!values.categoryId) errors.categoryId = 'Escolha uma categoria.';
  if (!values.location.trim()) errors.location = required;

  const start = parseDate(values.date);
  if (!values.date.trim()) errors.date = required;
  else if (!start) errors.date = 'Use uma data válida, como 11/09/2026.';

  const endText = values.endDate.trim() ? values.endDate : values.date;
  const end = parseDate(endText);
  if (values.endDate.trim() && !end)
    errors.endDate = 'Use uma data válida, como 12/09/2026.';
  else if (start && end && end < start)
    errors.endDate = 'A data final não pode ser antes da inicial.';

  const startTime = parseTime(values.startTime);
  const endTime = parseTime(values.endTime);
  if (!values.startTime.trim()) errors.startTime = required;
  else if (!startTime) errors.startTime = 'Use um horário válido, como 09:30.';
  if (!values.endTime.trim()) errors.endTime = required;
  else if (!endTime) errors.endTime = 'Use um horário válido, como 11:00.';
  else if (start && end && start === end && startTime && endTime <= startTime)
    errors.endTime = 'O horário final deve ser depois do inicial.';

  const capacity = Number(values.maximumParticipants);
  if (!values.maximumParticipants.trim()) errors.maximumParticipants = required;
  else if (!Number.isInteger(capacity) || capacity < 1)
    errors.maximumParticipants = 'Informe um número de vagas maior que zero.';

  const price = parsePrice(values.price);
  if (price === null) errors.price = 'Use um valor como 25,50.';
  else if (price > 0 && values.paymentMethod === 'FREE')
    errors.paymentMethod = 'Workshop pago precisa de PIX ou cartão.';
  else if (price === 0 && values.paymentMethod !== 'FREE')
    errors.paymentMethod = 'Sem valor, a forma de pagamento deve ser gratuita.';

  const registrationEnd = parseDate(values.registrationEnd);
  if (!values.registrationEnd.trim()) errors.registrationEnd = required;
  else if (!registrationEnd)
    errors.registrationEnd = 'Use uma data válida, como 10/09/2026.';
  else if (start && registrationEnd > start)
    errors.registrationEnd =
      'As inscrições devem encerrar até o dia do workshop.';
  else if (endOfDayInstant(registrationEnd) < today.toISOString())
    errors.registrationEnd = 'Escolha uma data de hoje em diante.';

  if (start && !errors.date) {
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const [y, m, d] = start.split('-').map(Number);
    if (new Date(y, m - 1, d) < startOfToday)
      errors.date = 'O workshop não pode começar no passado.';
  }
  return errors;
}

/** Call only after validateWorkshopForm returned no errors. */
export function toWorkshopInput(
  values: WorkshopFormValues,
  now = new Date(),
  previousRegistrationStart?: string,
): WorkshopInput {
  const start = parseDate(values.date) as string;
  const end = values.endDate.trim()
    ? (parseDate(values.endDate) as string)
    : start;
  const price = parsePrice(values.price) as number;
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    image: null,
    themeId: values.themeId,
    categoryId: values.categoryId,
    startDate: start,
    endDate: end,
    startTime: parseTime(values.startTime) as string,
    endTime: parseTime(values.endTime) as string,
    location: values.location.trim(),
    modality: values.modality,
    price,
    registrationStart: previousRegistrationStart ?? now.toISOString(),
    registrationEnd: endOfDayInstant(
      parseDate(values.registrationEnd) as string,
    ),
    maximumParticipants: Number(values.maximumParticipants),
    paymentMethod: values.paymentMethod,
    championship: false,
    additionalInformation: values.additionalInformation.trim() || null,
  };
}

export function toFormValues(workshop: ManagedWorkshop): WorkshopFormValues {
  const registrationEnd = new Date(workshop.registrationEnd);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    title: workshop.title,
    description: workshop.description,
    themeId: workshop.themeId,
    categoryId: workshop.categoryId,
    date: formatDate(workshop.startDate),
    endDate:
      workshop.endDate === workshop.startDate
        ? ''
        : formatDate(workshop.endDate),
    startTime: workshop.startTime.slice(0, 5),
    endTime: workshop.endTime.slice(0, 5),
    location: workshop.location,
    maximumParticipants: String(workshop.maximumParticipants),
    modality: workshop.modality,
    price: workshop.price ? String(workshop.price).replace('.', ',') : '',
    paymentMethod: workshop.paymentMethod,
    registrationEnd: `${pad(registrationEnd.getDate())}/${pad(
      registrationEnd.getMonth() + 1,
    )}/${registrationEnd.getFullYear()}`,
    additionalInformation: workshop.additionalInformation ?? '',
  };
}

/** Maps API field names to form fields so server hints land on the right input. */
export function serverFieldToForm(field: string): keyof WorkshopFormValues {
  const map: Record<string, keyof WorkshopFormValues> = {
    startDate: 'date',
    endDate: 'endDate',
    registrationStart: 'registrationEnd',
    registrationEnd: 'registrationEnd',
  };
  return map[field] ?? (field as keyof WorkshopFormValues);
}
