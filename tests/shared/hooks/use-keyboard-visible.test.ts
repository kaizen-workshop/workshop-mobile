import { createWebKeyboardDetector } from '@/shared/hooks/use-keyboard-visible';

describe('web keyboard detection', () => {
  it('detects iOS Safari, where only the visual viewport shrinks', () => {
    const detect = createWebKeyboardDetector();
    expect(detect(390, 844, 844)).toBe(false);
    expect(detect(390, 844, 480)).toBe(true);
    expect(detect(390, 844, 844)).toBe(false);
  });

  it('detects Android Chrome, where the whole window shrinks', () => {
    const detect = createWebKeyboardDetector();
    expect(detect(390, 844, 844)).toBe(false);
    expect(detect(390, 430, 430)).toBe(true);
    expect(detect(390, 844, 844)).toBe(false);
  });

  it('ignores small changes such as a collapsing address bar', () => {
    const detect = createWebKeyboardDetector();
    detect(390, 844, 844);
    expect(detect(390, 790, 790)).toBe(false);
  });

  it('starts over after a rotation instead of reading it as a keyboard', () => {
    const detect = createWebKeyboardDetector();
    detect(390, 844, 844);
    expect(detect(844, 390, 390)).toBe(false);
  });
});
