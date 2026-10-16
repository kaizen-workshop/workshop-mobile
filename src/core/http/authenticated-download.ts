import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { AppError, toAppError } from '@/core/errors';

export type DownloadRequest = Readonly<{
  url: string;
  accessToken: string;
  filename: string;
  mimeType?: string;
}>;

/**
 * Downloads a file that needs the session token. On web the browser saves it; on devices it is
 * stored in the cache and handed to the share sheet so the person can open or save it.
 */
export async function downloadAuthenticatedFile(request: DownloadRequest) {
  if (Platform.OS === 'web') return downloadOnWeb(request);
  return downloadOnDevice(request);
}

async function downloadOnWeb({ url, accessToken, filename }: DownloadRequest) {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    throw new AppError({ category: 'network' });
  }
  if (!response.ok)
    throw toAppError(
      new AppError({ category: 'unknown', status: response.status }),
    );
  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
}

async function downloadOnDevice({
  url,
  accessToken,
  filename,
  mimeType,
}: DownloadRequest) {
  if (!FileSystem.cacheDirectory || !(await Sharing.isAvailableAsync()))
    throw new AppError({
      category: 'unknown',
      technicalMessage: 'File sharing is unavailable on this device.',
    });
  const target = `${FileSystem.cacheDirectory}${filename}`;
  const result = await FileSystem.downloadAsync(url, target, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (result.status < 200 || result.status >= 300)
    throw toAppError(
      new AppError({ category: 'unknown', status: result.status }),
    );
  await Sharing.shareAsync(result.uri, {
    ...(mimeType ? { mimeType } : {}),
    dialogTitle: `Salvar ${filename}`,
  });
}
