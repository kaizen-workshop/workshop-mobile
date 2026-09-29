import { colors, radii, sizes, spacing, typography } from '@/shared/theme';

function relativeLuminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string) {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);

  return (lighter + 0.05) / (darker + 0.05);
}

it('exposes the small shared visual token set', () => {
  expect(colors.brand).toBe('#00579D');
  expect(spacing.md).toBe(16);
  expect(radii.md).toBe(6);
  expect(typography.body).toBe(16);
  expect(typography.familyRegular).toBe('Roboto_400Regular');
  expect(sizes.touchTarget).toBeGreaterThanOrEqual(44);
});

it.each([
  ['body text', colors.text, colors.background],
  ['muted text', colors.textMuted, colors.background],
  ['brand text', colors.brand, colors.background],
  ['button text', colors.onBrand, colors.brand],
])(
  '%s meets WCAG AA contrast for normal text',
  (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  },
);
