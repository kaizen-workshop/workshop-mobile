import { useCallback } from 'react';

import { AppError, describeError } from '@/core/errors';
import { useAdminGateway } from './use-admin-gateway';
import { useAsyncData } from './use-async-data';
import { serverFieldToForm, type WorkshopFormErrors } from './workshop-form';

/** Loads the themes and categories every workshop form needs. */
export function useTaxonomies() {
  const gateway = useAdminGateway();
  const load = useCallback(async () => {
    const [themes, categories] = await Promise.all([
      gateway.themes(),
      gateway.categories(),
    ]);
    return { themes, categories };
  }, [gateway]);
  const result = useAsyncData(load);
  return {
    categories: result.data?.categories ?? [],
    error: result.error,
    load: result.reload,
    status: result.status,
    themes: result.data?.themes ?? [],
  };
}

/** Turns a failed save into a banner message plus per-field hints. */
export function describeSaveFailure(cause: unknown): {
  formError: string;
  serverErrors: WorkshopFormErrors;
} {
  const serverErrors: WorkshopFormErrors = {};
  if (cause instanceof AppError)
    for (const item of cause.fieldErrors)
      serverErrors[serverFieldToForm(item.field)] = item.message;
  return {
    formError: describeError(cause, {
      bad_request:
        'Alguma informação não foi aceita. Revise as datas, os horários e os valores.',
      forbidden: 'Você não tem permissão para alterar este workshop.',
      conflict:
        'O workshop mudou de situação e não pode mais ser editado. Volte e atualize a tela.',
      not_found: 'Este workshop não existe mais.',
    }).message,
    serverErrors,
  };
}
