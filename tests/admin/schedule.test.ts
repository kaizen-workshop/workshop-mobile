import { formatScheduled, toScheduledInstant } from '@/admin/schedule';

const now = new Date(2026, 9, 9, 10, 0);

it('converts a local date and time into an ISO instant', () => {
  const result = toScheduledInstant('15/10/2026', '09:30', now);
  expect(result.error).toBeUndefined();
  expect(new Date(result.instant as string).getTime()).toBe(
    new Date(2026, 9, 15, 9, 30).getTime(),
  );
});

it('explains invalid dates and times', () => {
  expect(toScheduledInstant('31/02/2026', '09:30', now).error).toMatch(
    /data válida/,
  );
  expect(toScheduledInstant('15/10/2026', '25:00', now).error).toMatch(
    /horário válido/,
  );
});

it('refuses moments that are not in the future', () => {
  expect(toScheduledInstant('09/10/2026', '09:00', now).error).toMatch(
    /futuro/,
  );
  expect(toScheduledInstant('09/10/2026', '10:00', now).error).toMatch(
    /futuro/,
  );
  expect(toScheduledInstant('09/10/2026', '10:05', now).instant).toBeDefined();
});

it('formats an instant for display', () => {
  const iso = new Date(2026, 9, 15, 9, 5).toISOString();
  expect(formatScheduled(iso)).toBe('15/10/2026 às 09:05');
  expect(formatScheduled('nope')).toBe('');
});
