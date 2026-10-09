import { useState } from 'react';

import {
  Card,
  Field,
  LinkButton,
  PrimaryButton,
  SectionTitle,
} from './admin-ui';
import { toScheduledInstant } from './schedule';
import { maskDate, maskTime } from './workshop-form';

/** Date + time form that confirms with an ISO instant, or explains what is wrong. */
export function SchedulePanel({
  busy,
  confirmLabel = 'Confirmar agendamento',
  onCancel,
  onConfirm,
  title,
}: Readonly<{
  busy?: boolean;
  confirmLabel?: string;
  onCancel(): void;
  onConfirm(instant: string): void;
  title: string;
}>) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState<string>();

  const submit = () => {
    const result = toScheduledInstant(date, time);
    if (result.instant === undefined) return setError(result.error);
    setError(undefined);
    onConfirm(result.instant);
  };

  return (
    <Card>
      <SectionTitle>{title}</SectionTitle>
      <Field
        hint="Horário de Brasília (o do seu aparelho)."
        keyboardType="number-pad"
        label="Data da publicação"
        onChangeText={(value) => {
          setDate(maskDate(value));
          setError(undefined);
        }}
        placeholder="DD/MM/AAAA"
        value={date}
      />
      <Field
        error={error}
        keyboardType="number-pad"
        label="Horário"
        onChangeText={(value) => {
          setTime(maskTime(value));
          setError(undefined);
        }}
        placeholder="HH:MM"
        value={time}
      />
      <PrimaryButton busy={busy} label={confirmLabel} onPress={submit} />
      <LinkButton label="Voltar" onPress={onCancel} />
    </Card>
  );
}
