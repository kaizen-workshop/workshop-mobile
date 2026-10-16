/**
 * Mirrors the API password rule (8–128 characters with letters and digits) so the
 * user gets immediate feedback. The API remains the authority.
 */
export const passwordPolicyHint =
  'Use de 8 a 128 caracteres, com letras e números.';

export function passwordPolicyError(password: string): string | null {
  if (
    password.length < 8 ||
    password.length > 128 ||
    !/[A-Za-z]/.test(password) ||
    !/\d/.test(password)
  )
    return `A nova senha não atende aos requisitos. ${passwordPolicyHint}`;
  return null;
}
