import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  allowedUploadTypes,
  MediaScreen,
  useAdminGateway,
  useAsyncData,
  validateUpload,
  type PickedFile,
  type WorkshopFile,
} from '@/admin';
import { getEnvironment } from '@/core/config';
import { describeError } from '@/core/errors';
import { StatePage } from '@/navigation';
import { ErrorState, LoadingState } from '@/shared/presentation';

export default function WorkshopMediaRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const gateway = useAdminGateway();
  const [busy, setBusy] = useState(false);
  // Bumped after every image change so the preview is fetched again.
  const [imageVersion, setImageVersion] = useState(0);
  const [feedback, setFeedback] = useState<{
    tone: 'danger' | 'success';
    message: string;
  }>();

  const load = useCallback(async () => {
    const [workshop, attachments] = await Promise.all([
      gateway.loadWorkshop(id),
      gateway.attachments(id),
    ]);
    return { workshop, attachments };
  }, [gateway, id]);
  const loaded = useAsyncData(load);

  if (loaded.status !== 'success' || !loaded.data)
    return (
      <StatePage
        eyebrow="ARWEG · Administrativo"
        fallback="/admin/workshops"
        kind="back"
        title="Imagem e anexos"
      >
        {loaded.status === 'error' ? (
          <ErrorState error={loaded.error} onRetry={loaded.reload} />
        ) : (
          <LoadingState message="Carregando imagem e anexos..." />
        )}
      </StatePage>
    );

  /** Opens the picker; resolves to undefined when cancelled or refused. */
  const pick = async (): Promise<PickedFile | undefined> => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: [...allowedUploadTypes],
    });
    if (result.canceled) return undefined;
    const asset = result.assets[0];
    const file: PickedFile = {
      file: asset.file,
      mimeType: asset.mimeType,
      name: asset.name,
      size: asset.size,
      uri: asset.uri,
    };
    const problem = validateUpload(file);
    if (problem) {
      setFeedback({ tone: 'danger', message: problem });
      return undefined;
    }
    return file;
  };

  const run = async (action: () => Promise<void>, success: string) => {
    if (busy) return;
    setBusy(true);
    setFeedback(undefined);
    try {
      await action();
      setImageVersion((value) => value + 1);
      loaded.refresh();
      setFeedback({ tone: 'success', message: success });
    } catch (cause) {
      setFeedback({
        tone: 'danger',
        message: describeError(cause, {
          bad_request:
            'O arquivo não foi aceito. Use JPEG, PNG ou WebP de até 10 MB.',
          forbidden:
            'Você não tem permissão para alterar os arquivos deste workshop.',
          not_found: 'Este workshop não existe mais.',
        }).message,
      });
    } finally {
      setBusy(false);
    }
  };

  const chooseImage = async () => {
    const file = await pick();
    if (file)
      await run(() => gateway.uploadImage(id, file), 'Imagem atualizada.');
  };
  const addAttachment = async () => {
    const file = await pick();
    if (file)
      await run(() => gateway.uploadAttachment(id, file), 'Anexo enviado.');
  };

  const { workshop, attachments } = loaded.data;

  return (
    <MediaScreen
      attachments={attachments}
      busy={busy}
      feedback={feedback}
      imageUrl={
        workshop.image
          ? `${getEnvironment().apiUrl}/workshops/${encodeURIComponent(id)}/image/content?v=${imageVersion}`
          : undefined
      }
      onAddAttachment={() => void addAttachment()}
      onChooseImage={() => void chooseImage()}
      onDeleteAttachment={(file: WorkshopFile) =>
        void run(() => gateway.deleteAttachment(id, file.id), 'Anexo excluído.')
      }
      onRemoveImage={() =>
        void run(() => gateway.deleteImage(id), 'Imagem removida.')
      }
      title={workshop.title}
    />
  );
}
