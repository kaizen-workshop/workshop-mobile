jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///default/',
  downloadAsync: jest.fn(),
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

import type { TokenStorage } from '@/core/secure-storage';
import { createWorkshopAttachmentOpener } from '@/workshop/data';

const tokens: TokenStorage = {
  read: jest
    .fn()
    .mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }),
  save: jest.fn(),
  clear: jest.fn(),
};

it('downloads an authenticated attachment and opens the local file', async () => {
  const downloadAsync = jest.fn().mockResolvedValue({
    uri: 'file:///cache/workshop-attachment-1.pdf',
    status: 200,
    mimeType: 'application/octet-stream',
  });
  const shareAsync = jest.fn().mockResolvedValue(undefined);
  const opener = createWorkshopAttachmentOpener(
    { variant: 'development', apiUrl: 'https://api.example.test/api/v1' },
    tokens,
    { cacheDirectory: 'file:///cache/', downloadAsync },
    { isAvailableAsync: jest.fn().mockResolvedValue(true), shareAsync },
  );

  await opener.open('workshop/1', {
    id: 'attachment-1',
    name: '../material.PDF',
    contentType: 'application/pdf',
  });

  expect(downloadAsync).toHaveBeenCalledWith(
    'https://api.example.test/api/v1/workshops/workshop%2F1/attachments/attachment-1/content',
    'file:///cache/workshop-attachment-1.pdf',
    { headers: { Authorization: 'Bearer access' } },
  );
  expect(shareAsync).toHaveBeenCalledWith(
    'file:///cache/workshop-attachment-1.pdf',
    {
      mimeType: 'application/pdf',
      dialogTitle: 'Abrir ../material.PDF',
    },
  );
});

it('fails before downloading when native sharing is unavailable', async () => {
  const downloadAsync = jest.fn();
  const opener = createWorkshopAttachmentOpener(
    { variant: 'development', apiUrl: 'https://api.example.test/api/v1' },
    tokens,
    { cacheDirectory: 'file:///cache/', downloadAsync },
    {
      isAvailableAsync: jest.fn().mockResolvedValue(false),
      shareAsync: jest.fn(),
    },
  );

  await expect(
    opener.open('workshop-1', { id: 'attachment-1', name: 'material.pdf' }),
  ).rejects.toMatchObject({ category: 'unknown' });
  expect(downloadAsync).not.toHaveBeenCalled();
});

it('rejects unsuccessful authenticated downloads', async () => {
  const opener = createWorkshopAttachmentOpener(
    { variant: 'development', apiUrl: 'https://api.example.test/api/v1' },
    tokens,
    {
      cacheDirectory: 'file:///cache/',
      downloadAsync: jest.fn().mockResolvedValue({
        uri: 'file:///cache/material.pdf',
        status: 403,
        mimeType: null,
      }),
    },
    {
      isAvailableAsync: jest.fn().mockResolvedValue(true),
      shareAsync: jest.fn(),
    },
  );

  await expect(
    opener.open('workshop-1', { id: 'attachment-1', name: 'material.pdf' }),
  ).rejects.toMatchObject({ status: 403 });
});

it('refreshes once and retries an attachment rejected with 401', async () => {
  const downloadAsync = jest
    .fn()
    .mockResolvedValueOnce({
      uri: 'file:///cache/material.pdf',
      status: 401,
      mimeType: null,
    })
    .mockResolvedValueOnce({
      uri: 'file:///cache/material.pdf',
      status: 200,
      mimeType: 'application/pdf',
    });
  const shareAsync = jest.fn();
  const refreshSession = jest.fn().mockResolvedValue({
    accessToken: 'rotated-access',
    refreshToken: 'rotated-refresh',
  });
  const opener = createWorkshopAttachmentOpener(
    { variant: 'development', apiUrl: 'https://api.example.test/api/v1' },
    tokens,
    { cacheDirectory: 'file:///cache/', downloadAsync },
    { isAvailableAsync: jest.fn().mockResolvedValue(true), shareAsync },
    refreshSession,
  );

  await opener.open('workshop-1', {
    id: 'attachment-1',
    name: 'material.pdf',
  });

  expect(refreshSession).toHaveBeenCalledTimes(1);
  expect(downloadAsync).toHaveBeenLastCalledWith(
    expect.any(String),
    'file:///cache/workshop-attachment-1.pdf',
    { headers: { Authorization: 'Bearer rotated-access' } },
  );
  expect(shareAsync).toHaveBeenCalledTimes(1);
});
