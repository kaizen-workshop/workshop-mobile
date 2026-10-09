import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/** The on-screen keyboard takes at least this much of the viewport when it is open. */
export const webKeyboardThreshold = 150;

/**
 * Decides, from viewport heights, whether a keyboard is open on web.
 *
 * Browsers disagree: iOS Safari keeps the layout viewport and only shrinks the visual
 * viewport, while Android Chrome shrinks the whole window. Comparing against the tallest
 * height seen for the current width works for both.
 */
export function createWebKeyboardDetector() {
  let width = 0;
  let baseline = 0;
  return (innerWidth: number, innerHeight: number, visualHeight: number) => {
    if (innerWidth !== width) {
      // Rotation or a real resize: start measuring again.
      width = innerWidth;
      baseline = 0;
    }
    baseline = Math.max(baseline, innerHeight, visualHeight);
    return baseline - visualHeight > webKeyboardThreshold;
  };
}

/**
 * True while the on-screen keyboard is open. Screens use it to drop decorative content and
 * floating controls so the field being typed in keeps as much room as possible.
 */
export function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const viewport = globalThis.visualViewport;
      if (!viewport) return undefined;
      const detect = createWebKeyboardDetector();
      const update = () =>
        setVisible(
          detect(
            globalThis.innerWidth,
            globalThis.innerHeight,
            viewport.height,
          ),
        );
      update();
      viewport.addEventListener('resize', update);
      globalThis.addEventListener('resize', update);
      return () => {
        viewport.removeEventListener('resize', update);
        globalThis.removeEventListener('resize', update);
      };
    }
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => setVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return visible;
}
