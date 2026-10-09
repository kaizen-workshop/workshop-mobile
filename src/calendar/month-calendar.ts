export type CalendarCell = Readonly<{
  /** yyyy-MM-dd */
  date: string;
  day: number;
  inMonth: boolean;
}>;

export const weekdayInitials = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const;

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;

const weekdayNames = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const;

export function toIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Full weeks (Sunday first) covering the month, including leading/trailing days. */
export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const last = new Date(year, month + 1, 0);
  const weeks = Math.ceil((first.getDay() + last.getDate()) / 7);
  return Array.from({ length: weeks * 7 }, (_, index) => {
    const date = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + index,
    );
    return {
      date: toIsoDate(date),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    };
  });
}

export function monthTitle(year: number, month: number) {
  return `${monthNames[month]} ${year}`;
}

/** "Sexta-feira, 11 de setembro" */
export function selectedDayTitle(isoDate: string) {
  const date = parseIsoDate(isoDate);
  return `${weekdayNames[date.getDay()]}, ${date.getDate()} de ${monthNames[
    date.getMonth()
  ].toLowerCase()}`;
}

/** Workshops occurring on a day (multi-day workshops span start..end). */
export function occursOn(
  item: Readonly<{ startDate: string; endDate: string }>,
  isoDate: string,
) {
  return item.startDate <= isoDate && isoDate <= item.endDate;
}

export function monthRange(year: number, month: number) {
  return {
    from: toIsoDate(new Date(year, month, 1)),
    to: toIsoDate(new Date(year, month + 1, 0)),
  };
}

/** "AGOSTO DE 2026" style heading for grouping history. */
export function monthHeading(isoDate: string) {
  const date = parseIsoDate(isoDate);
  return `${monthNames[date.getMonth()]} de ${date.getFullYear()}`;
}
