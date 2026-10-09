import type { NotificationItem } from '@/notification/domain';

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

/** HOJE / ONTEM / "09 de out." — the section a notification belongs to. */
export function notificationDayLabel(value: string, now = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diff = startOfDay(now) - startOfDay(date);
  if (diff === 0) return 'Hoje';
  if (diff === DAY) return 'Ontem';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

/** "Há 10 minutos" for today, "10/09 · 16:42" for earlier days. */
export function notificationTimeLabel(value: string, now = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (startOfDay(now) === startOfDay(date) && minutes >= 0) {
    if (minutes < 1) return 'Agora há pouco';
    if (minutes < 60)
      return `Há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    const hours = Math.floor(minutes / 60);
    return `Há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  const day = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
  const time = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
  return `${day} · ${time}`;
}

export function showsDayHeading(
  items: readonly NotificationItem[],
  index: number,
  now = new Date(),
) {
  if (index === 0) return true;
  return (
    notificationDayLabel(items[index].createdAt, now) !==
    notificationDayLabel(items[index - 1].createdAt, now)
  );
}
