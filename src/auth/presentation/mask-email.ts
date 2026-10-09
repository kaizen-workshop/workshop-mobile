/** "matheus07@gmail.com" -> "mat*****07@gmail.com"; short names keep one letter. */
export function maskEmail(email: string) {
  const at = email.lastIndexOf('@');
  if (at < 1) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (local.length <= 4) return `${local[0]}***${domain}`;
  return `${local.slice(0, 3)}*****${local.slice(-2)}${domain}`;
}
