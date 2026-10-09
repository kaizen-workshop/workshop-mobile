import { useState } from 'react';

import type { PaymentMethod, Taxonomy, WorkshopModality } from './admin';
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
import {
  emptyWorkshopForm,
  maskDate,
  maskTime,
  validateWorkshopForm,
  type WorkshopFormErrors,
  type WorkshopFormValues,
} from './workshop-form';

const modalities: readonly { value: WorkshopModality; label: string }[] = [
  { value: 'IN_PERSON', label: 'Presencial' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'HYBRID', label: 'Híbrido' },
];

const payments: readonly { value: PaymentMethod; label: string }[] = [
  { value: 'FREE', label: 'Gratuito' },
  { value: 'PIX', label: 'PIX' },
  { value: 'CREDIT_CARD', label: 'Cartão' },
];

export function WorkshopFormScreen({
  busy = false,
  categories,
  formError,
  heading,
  initial = emptyWorkshopForm,
  onCancel,
  onSubmit,
  serverErrors,
  submitLabel,
  subtitle,
  themes,
}: Readonly<{
  busy?: boolean;
  categories: readonly Taxonomy[];
  formError?: string;
  heading: string;
  initial?: WorkshopFormValues;
  onCancel(): void;
  onSubmit(values: WorkshopFormValues): void;
  /** Hints the API returned per field, shown beside the matching input. */
  serverErrors?: WorkshopFormErrors;
  submitLabel: string;
  subtitle: string;
  themes: readonly Taxonomy[];
}>) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<WorkshopFormErrors>({});
  const shown = { ...serverErrors, ...errors };

  const set = <K extends keyof WorkshopFormValues>(
    key: K,
    value: WorkshopFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = () => {
    const found = validateWorkshopForm(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
  };

  const invalidCount = Object.values(shown).filter(Boolean).length;

  return (
    <AdminPage fallback="/admin/workshops" title={heading}>
      <Heading title={heading} subtitle={subtitle} />

      <Card>
        <Field
          error={shown.title}
          label="Nome do workshop"
          maxLength={180}
          onChangeText={(value) => set('title', value)}
          placeholder="Ex.: Workshop Futebol"
          value={values.title}
        />
        <ChoiceChips
          label="Categoria"
          onChange={(value) => set('categoryId', value)}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          value={values.categoryId || undefined}
        />
        {shown.categoryId ? (
          <Notice tone="danger">{shown.categoryId}</Notice>
        ) : null}
        <ChoiceChips
          label="Tema"
          onChange={(value) => set('themeId', value)}
          options={themes.map((t) => ({ value: t.id, label: t.name }))}
          value={values.themeId || undefined}
        />
        {shown.themeId ? <Notice tone="danger">{shown.themeId}</Notice> : null}
        <Field
          error={shown.description}
          label="Descrição"
          multiline
          onChangeText={(value) => set('description', value)}
          placeholder="Descreva a proposta e as atividades do workshop"
          value={values.description}
        />
      </Card>

      <Card>
        <Field
          error={shown.date}
          hint="Dia em que o workshop começa."
          keyboardType="number-pad"
          label="Data"
          onChangeText={(value) => set('date', maskDate(value))}
          placeholder="DD/MM/AAAA"
          value={values.date}
        />
        <Field
          error={shown.endDate}
          hint="Deixe em branco se termina no mesmo dia."
          keyboardType="number-pad"
          label="Data final (opcional)"
          onChangeText={(value) => set('endDate', maskDate(value))}
          placeholder="DD/MM/AAAA"
          value={values.endDate}
        />
        <Field
          error={shown.startTime}
          keyboardType="number-pad"
          label="Horário de início"
          onChangeText={(value) => set('startTime', maskTime(value))}
          placeholder="HH:MM"
          value={values.startTime}
        />
        <Field
          error={shown.endTime}
          keyboardType="number-pad"
          label="Horário de término"
          onChangeText={(value) => set('endTime', maskTime(value))}
          placeholder="HH:MM"
          value={values.endTime}
        />
        <Field
          error={shown.location}
          label="Local"
          onChangeText={(value) => set('location', value)}
          placeholder="Informe o local"
          value={values.location}
        />
        <ChoiceChips
          label="Modalidade"
          onChange={(value) => set('modality', value)}
          options={modalities}
          value={values.modality}
        />
        <Field
          error={shown.maximumParticipants}
          keyboardType="number-pad"
          label="Vagas"
          onChangeText={(value) =>
            set('maximumParticipants', value.replace(/\D/g, ''))
          }
          placeholder="Ex.: 30"
          value={values.maximumParticipants}
        />
      </Card>

      <Card>
        <Field
          error={shown.price}
          hint="Deixe em branco para workshop gratuito."
          keyboardType="decimal-pad"
          label="Valor (R$)"
          onChangeText={(value) => set('price', value)}
          placeholder="0,00"
          value={values.price}
        />
        <ChoiceChips
          label="Forma de pagamento"
          onChange={(value) => set('paymentMethod', value)}
          options={payments}
          value={values.paymentMethod}
        />
        {shown.paymentMethod ? (
          <Notice tone="danger">{shown.paymentMethod}</Notice>
        ) : null}
        <Field
          error={shown.registrationEnd}
          hint="Último dia para se inscrever. As inscrições abrem assim que você publicar."
          keyboardType="number-pad"
          label="Inscrições até"
          onChangeText={(value) => set('registrationEnd', maskDate(value))}
          placeholder="DD/MM/AAAA"
          value={values.registrationEnd}
        />
        <Field
          label="Informações adicionais (opcional)"
          multiline
          onChangeText={(value) => set('additionalInformation', value)}
          value={values.additionalInformation}
        />
      </Card>

      {formError ? <Notice tone="danger">{formError}</Notice> : null}
      {invalidCount > 0 && !formError ? (
        <Notice tone="danger">
          {invalidCount === 1
            ? 'Corrija o campo destacado para continuar.'
            : `Corrija os ${invalidCount} campos destacados para continuar.`}
        </Notice>
      ) : null}

      <PrimaryButton busy={busy} label={submitLabel} onPress={submit} />
      <LinkButton label="Voltar" onPress={onCancel} />
    </AdminPage>
  );
}
