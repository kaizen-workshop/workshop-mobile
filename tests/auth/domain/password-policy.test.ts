import { passwordPolicyError } from '@/auth/domain/password-policy';

describe('passwordPolicyError', () => {
  it.each(['fraca', '1234567', 'somenteletras', '1234567890', 'a1'.repeat(65)])(
    'rejects %s',
    (password) => {
      expect(passwordPolicyError(password)).toMatch(
        /não atende aos requisitos/,
      );
    },
  );

  it('accepts passwords with 8+ characters, letters and digits', () => {
    expect(passwordPolicyError('Workshop@2026!')).toBeNull();
    expect(passwordPolicyError('senhaforte1')).toBeNull();
  });
});
