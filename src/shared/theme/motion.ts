import { Easing } from 'react-native-reanimated';

/** Durations in milliseconds. Every animation in the app picks one of these. */
export const durations = {
  instant: 0,
  fast: 120,
  base: 220,
  slow: 360,
} as const;

export const easings = {
  /** Elements entering the screen: quick start, soft landing. */
  enter: Easing.out(Easing.cubic),
  /** Elements leaving the screen. */
  exit: Easing.in(Easing.cubic),
  /** State changes that stay on screen. */
  standard: Easing.inOut(Easing.cubic),
} as const;

export const springs = {
  /** Press feedback and small toggles. */
  snappy: { damping: 18, mass: 0.6, stiffness: 320 },
  /** Larger movements such as sliding indicators and sheets. */
  smooth: { damping: 22, mass: 0.9, stiffness: 220 },
  /** Playful emphasis, for example the like heart. */
  bouncy: { damping: 10, mass: 0.6, stiffness: 260 },
} as const;

export const press = {
  scale: 0.97,
  opacity: 0.85,
} as const;

/** Delay between items of a staggered list entrance, and how many items stagger at all. */
export const stagger = {
  step: 40,
  maxItems: 8,
} as const;
