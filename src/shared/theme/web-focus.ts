import { Platform } from 'react-native';

import { colors } from './tokens';

/**
 * On web, fields in focus get the browser's default black outline, which clashes with the
 * design. Replace it with a brand-colored ring rather than removing it: keyboard users still
 * need to see where the focus is.
 */
export function installWebFocusStyle() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (document.getElementById('app-focus-style')) return;
  const style = document.createElement('style');
  style.id = 'app-focus-style';
  style.textContent = `input:focus, textarea:focus {
    outline: 2px solid ${colors.brand} !important;
    outline-offset: 1px;
    border-radius: 12px;
  }`;
  document.head.appendChild(style);
}
