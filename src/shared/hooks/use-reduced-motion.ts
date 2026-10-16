import { useReducedMotion as useReanimatedReducedMotion } from 'react-native-reanimated';

/**
 * True when the user asked the OS to reduce motion. Animated components check it and fall
 * back to an instant or very short fade instead of moving.
 */
export function useReducedMotion() {
  return useReanimatedReducedMotion();
}
