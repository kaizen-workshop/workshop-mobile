import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import type { EnvironmentConfig } from '@/core/config';
import { AppError } from '@/core/errors';
import type { TokenStorage } from '@/core/secure-storage';
import type { WorkshopAttachment } from '@/workshop/domain';

type FileSystemAdapter = Readonly<{
  cacheDirectory: string | null;
  downloadAsync(
    url: string,
    fileUri: string,
    options: { headers: Record<string, string> },
  ): Promise<{ uri: string; status: number; mimeType: string | null }>;
}>;

type SharingAdapter = Readonly<{
  isAvailableAsync(): Promise<boolean>;
  shareAsync(
    uri: string,
    options: { mimeType?: string; dialogTitle?: string },
  ): Promise<void>;
}>;

export type WorkshopAttachmentOpener = Readonly<{
  open(workshopId: string, attachment: WorkshopAttachment): Promise<void>;
}>;

export function createWorkshopAttachmentOpener(
  config: EnvironmentConfig,
  tokenStorage: TokenStorage,
  fileSystem: FileSystemAdapter = FileSystem,
  sharing: SharingAdapter = Sharing,
): WorkshopAttachmentOpener {
  return {
    async open(workshopId, attachment) {
      if (!workshopId.trim() || !attachment.id.trim())
        throw new AppError({ category: 'bad_request' });
      const tokens = await tokenStorage.read();
      if (!tokens) throw new AppError({ category: 'unauthorized' });
      if (!fileSystem.cacheDirectory || !(await sharing.isAvailableAsync()))
        throw unavailableError();

      const extension = safeExtension(attachment.name);
      const fileUri = `${fileSystem.cacheDirectory}workshop-${encodeURIComponent(attachment.id)}${extension}`;
      const result = await fileSystem.downloadAsync(
        `${config.apiUrl}/workshops/${encodeURIComponent(workshopId)}/attachments/${encodeURIComponent(attachment.id)}/content`,
        fileUri,
        { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
      );
      if (result.status < 200 || result.status >= 300)
        throw new AppError({ category: 'unknown', status: result.status });

      await sharing.shareAsync(result.uri, {
        ...(attachment.contentType
          ? { mimeType: attachment.contentType }
          : result.mimeType
            ? { mimeType: result.mimeType }
            : {}),
        dialogTitle: `Abrir ${attachment.name}`,
      });
    },
  };
}

function safeExtension(filename: string) {
  const match = /\.([a-z0-9]{1,10})$/i.exec(filename.trim());
  return match ? `.${match[1].toLowerCase()}` : '';
}

function unavailableError() {
  return new AppError({
    category: 'unknown',
    technicalMessage: 'Attachment opening is unavailable on this device.',
  });
}
