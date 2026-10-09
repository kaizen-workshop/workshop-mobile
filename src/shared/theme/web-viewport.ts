import { Platform } from 'react-native';

export type ViewportBox = Readonly<{
  height: number;
  offsetTop: number;
  scale: number;
}>;

/**
 * Size the app should take: exactly the part of the screen the person can see.
 *
 * Modern mobile browsers draw the keyboard OVER the page without resizing it, which hides the
 * bottom of the screen (the chat composer, form buttons). The visual viewport is the visible
 * part, so the root follows it. While the page is pinch-zoomed the visual viewport is smaller
 * on purpose, so the layout is left alone.
 */
export function viewportToRootStyle(viewport: ViewportBox) {
  if (viewport.scale !== 1) return { height: '100%', offsetTop: '0px' };
  return {
    height: `${Math.round(viewport.height)}px`,
    offsetTop: `${Math.round(viewport.offsetTop)}px`,
  };
}

export function installWebViewportFit() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const viewport = globalThis.visualViewport;
  if (!viewport || document.getElementById('app-viewport-style')) return;

  // Chrome 108+ and Firefox can also be asked to shrink the layout with the keyboard.
  const meta = document.querySelector('meta[name="viewport"]');
  const content = meta?.getAttribute('content') ?? '';
  if (meta && !content.includes('interactive-widget'))
    meta.setAttribute(
      'content',
      `${content}, interactive-widget=resizes-content`,
    );

  const style = document.createElement('style');
  style.id = 'app-viewport-style';
  style.textContent = `html, body { height: 100%; overflow: hidden; }
    #root { height: var(--app-height, 100%) !important; transform: translateY(var(--app-offset, 0px)); }`;
  document.head.appendChild(style);

  const apply = () => {
    const next = viewportToRootStyle(viewport);
    document.documentElement.style.setProperty('--app-height', next.height);
    document.documentElement.style.setProperty('--app-offset', next.offsetTop);
  };
  apply();
  viewport.addEventListener('resize', apply);
  viewport.addEventListener('scroll', apply);
}
