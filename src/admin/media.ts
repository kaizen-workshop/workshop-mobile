/** What the API accepts for workshop images and attachments. */
export const maxUploadBytes = 10 * 1024 * 1024;
export const allowedUploadTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type PickedFile = Readonly<{
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
  /** Set on web, where the picker hands over a real File. */
  file?: File;
}>;

export type WorkshopFile = Readonly<{
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
}>;

/** Returns a message explaining why the file would be refused, or null when it is fine. */
export function validateUpload(file: PickedFile): string | null {
  const type = (file.mimeType ?? guessType(file.name)).toLowerCase();
  if (!(allowedUploadTypes as readonly string[]).includes(type))
    return 'Use uma imagem JPEG, PNG ou WebP.';
  if (file.size !== undefined && file.size > maxUploadBytes)
    return `O arquivo tem ${formatSize(file.size)}. O limite é ${formatSize(maxUploadBytes)}.`;
  if (file.size === 0) return 'O arquivo está vazio.';
  return null;
}

export function guessType(name: string) {
  const extension = name.split('.').pop()?.toLowerCase();
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return 'application/octet-stream';
}

export function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}
