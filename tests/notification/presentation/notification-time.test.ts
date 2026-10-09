import {
  notificationDayLabel,
  notificationTimeLabel,
} from '@/notification/presentation/notification-time';

const now = new Date(2026, 8, 11, 18, 0);

it('labels same-day notifications relatively', () => {
  expect(
    notificationTimeLabel(new Date(2026, 8, 11, 17, 50).toISOString(), now),
  ).toBe('Há 10 minutos');
  expect(
    notificationTimeLabel(new Date(2026, 8, 11, 16, 0).toISOString(), now),
  ).toBe('Há 2 horas');
});

it('labels earlier notifications with date and time', () => {
  expect(
    notificationTimeLabel(new Date(2026, 8, 10, 16, 42).toISOString(), now),
  ).toBe('10/09 · 16:42');
});

it('groups notifications by day', () => {
  expect(
    notificationDayLabel(new Date(2026, 8, 11, 9, 0).toISOString(), now),
  ).toBe('Hoje');
  expect(
    notificationDayLabel(new Date(2026, 8, 10, 23, 0).toISOString(), now),
  ).toBe('Ontem');
});
