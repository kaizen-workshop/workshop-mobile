import { colors, radii, sizes, spacing, typography } from '@/shared/theme';

it('exposes the small shared visual token set', () => {
  expect(colors.brand).toBe('#00579D');
  expect(spacing.md).toBe(16);
  expect(radii.md).toBe(6);
  expect(typography.body).toBe(16);
  expect(typography.familyRegular).toBe('Roboto_400Regular');
  expect(sizes.touchTarget).toBeGreaterThanOrEqual(44);
});
