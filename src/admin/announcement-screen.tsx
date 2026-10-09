import { useState } from 'react';

import {
  AdminPage,
  Card,
  ChoiceChips,
  Field,
  Heading,
  LinkButton,
  Notice,
  PrimaryButton,
} from './admin-ui';

export type AnnouncementValues = { title: string; message: string };

export function validateAnnouncement(values: AnnouncementValues) {
  const errors: Partial<Record<keyof AnnouncementValues, string>> = {};
  if (!values.title.trim()) errors.title = 'Informe um título.';
  else if (values.title.trim().length > 160)
    errors.title = 'Use no máximo 160 caracteres.';
  if (!values.message.trim()) errors.message = 'Escreva a mensagem.';
  else if (values.message.trim().length > 4000)
    errors.message = 'Use no máximo 4.000 caracteres.';
  return errors;
}

export function AnnouncementScreen({
  busy,
  feedback,
  onCancel,
  onSelectWorkshop,
  onSend,
  recipients,
  selectedWorkshopId,
  workshops,
}: Readonly<{
  busy: boolean;
  feedback?: { tone: 'danger' | 'success'; message: string };
  onCancel(): void;
  onSelectWorkshop(id: string): void;
  onSend(values: AnnouncementValues): void;
  /** People who will be notified; undefined while loading. */
  recipients?: number;
  selectedWorkshopId?: string;
  workshops: readonly { id: string; title: string }[];
}>) {
  const [values, setValues] = useState<AnnouncementValues>({
    title: '',
    message: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof AnnouncementValues, string>>
  >({});
  const [workshopError, setWorkshopError] = useState<string>();

  const submit = () => {
    const found = validateAnnouncement(values);
    setErrors(found);
    const missingWorkshop = !selectedWorkshopId;
    setWorkshopError(missingWorkshop ? 'Escolha o workshop.' : undefined);
    if (!missingWorkshop && Object.keys(found).length === 0) onSend(values);
  };

  return (
    <AdminPage title="Enviar comunicado">
      <Heading
        title="Enviar comunicado"
        subtitle="Compartilhe uma mensagem com os inscritos confirmados."
      />
      <Card>
        {workshops.length === 0 ? (
          <Notice tone="info">
            Você ainda não tem workshops. Crie e publique um para enviar
            comunicados.
          </Notice>
        ) : (
          <ChoiceChips
            label="Workshop"
            onChange={onSelectWorkshop}
            options={workshops.map((w) => ({ value: w.id, label: w.title }))}
            value={selectedWorkshopId}
          />
        )}
        {workshopError ? <Notice tone="danger">{workshopError}</Notice> : null}
        {selectedWorkshopId ? (
          <Notice tone="info">
            {recipients === undefined
              ? 'Calculando destinatários...'
              : recipients === 0
                ? 'Este workshop ainda não tem inscritos confirmados para receber o comunicado.'
                : `${recipients} ${recipients === 1 ? 'pessoa receberá' : 'pessoas receberão'} este comunicado.`}
          </Notice>
        ) : null}
        <Field
          error={errors.title}
          label="Título"
          maxLength={160}
          onChangeText={(title) => {
            setValues((v) => ({ ...v, title }));
            setErrors((e) => ({ ...e, title: undefined }));
          }}
          placeholder="Ex.: Lembrete do workshop"
          value={values.title}
        />
        <Field
          error={errors.message}
          label="Mensagem"
          multiline
          onChangeText={(message) => {
            setValues((v) => ({ ...v, message }));
            setErrors((e) => ({ ...e, message: undefined }));
          }}
          placeholder="Escreva seu comunicado"
          value={values.message}
        />
      </Card>

      {feedback ? (
        <Notice tone={feedback.tone}>{feedback.message}</Notice>
      ) : null}

      <PrimaryButton
        busy={busy}
        disabled={recipients === 0}
        label="Enviar comunicado"
        onPress={submit}
      />
      <LinkButton label="Voltar" onPress={onCancel} />
    </AdminPage>
  );
}
