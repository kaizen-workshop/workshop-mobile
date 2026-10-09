import {
  formatSize,
  guessType,
  maxUploadBytes,
  validateUpload,
} from '@/admin/media';

it('accepts JPEG, PNG and WebP within the size limit', () => {
  expect(
    validateUpload({
      uri: 'x',
      name: 'a.png',
      mimeType: 'image/png',
      size: 1000,
    }),
  ).toBeNull();
  expect(validateUpload({ uri: 'x', name: 'foto.JPG' })).toBeNull();
});

it('refuses other types with an actionable message', () => {
  expect(
    validateUpload({ uri: 'x', name: 'a.pdf', mimeType: 'application/pdf' }),
  ).toMatch(/JPEG, PNG ou WebP/);
});

it('refuses files over 10 MB and empty files', () => {
  expect(
    validateUpload({
      uri: 'x',
      name: 'a.png',
      mimeType: 'image/png',
      size: maxUploadBytes + 1,
    }),
  ).toMatch(/limite é 10,0 MB/);
  expect(
    validateUpload({ uri: 'x', name: 'a.png', mimeType: 'image/png', size: 0 }),
  ).toMatch(/vazio/);
});

it('guesses the type from the extension and formats sizes', () => {
  expect(guessType('x.webp')).toBe('image/webp');
  expect(guessType('x.bin')).toBe('application/octet-stream');
  expect(formatSize(2048)).toBe('2 KB');
  expect(formatSize(3 * 1024 * 1024)).toBe('3,0 MB');
});
