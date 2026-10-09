import { parseDate, parseTime } from './workshop-form';

/** The API only accepts @Future instants; require a small margin so it never races. */
const minimumLeadMs = 60_000;

export type ScheduleResult =
  | Readonly<{ instant: string; error?: undefined }>
  | Readonly<{ instant?: undefined; error: string }>;

/**
 * Turns the typed date (DD/MM/AAAA) and time (HH:MM), in the person's local time zone,
 * into the ISO instant the API expects.
 */
export function toScheduledInstant(
  date: string,
  time: string,
  now = new Date(),
): ScheduleResult {
  const isoDate = parseDate(date);
  if (!isoDate) return { error: 'Use uma data válida, como 15/10/2026.' };
  const isoTime = parseTime(time);
  if (!isoTime) return { error: 'Use um horário válido, como 09:30.' };

  const [year, month, day] = isoDate.split('-').map(Number);
  const [hours, minutes] = isoTime.split(':').map(Number);
  const when = new Date(year, month - 1, day, hours, minutes);
  if (when.getTime() < now.getTime() + minimumLeadMs)
    return { error: 'Escolha uma data e um horário no futuro.' };
  return { instant: when.toISOString() };
}

/** "15/10/2026 às 09:30" for an ISO instant, in local time. */
export function formatScheduled(instant: string) {
  const value = new Date(instant);
  if (Number.isNaN(value.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()} às ${pad(value.getHours())}:${pad(value.getMinutes())}`;
}
