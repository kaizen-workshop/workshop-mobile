import { maskEmail } from '@/auth/presentation/mask-email';

it('masks the middle of the local part', () => {
  expect(maskEmail('matheus07@gmail.com')).toBe('mat*****07@gmail.com');
});

it('keeps very short local parts mostly hidden', () => {
  expect(maskEmail('ana@x.com')).toBe('a***@x.com');
});

it('returns values that are not e-mails untouched', () => {
  expect(maskEmail('demo.ana')).toBe('demo.ana');
});
