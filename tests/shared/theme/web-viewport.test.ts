import { viewportToRootStyle } from '@/shared/theme/web-viewport';

it('fits the app to the visible area when the keyboard overlays the page', () => {
  expect(
    viewportToRootStyle({ height: 430.4, offsetTop: 0, scale: 1 }),
  ).toEqual({
    height: '430px',
    offsetTop: '0px',
  });
});

it('follows the visual viewport when the browser pans it (iOS)', () => {
  expect(
    viewportToRootStyle({ height: 420, offsetTop: 96.6, scale: 1 }),
  ).toEqual({
    height: '420px',
    offsetTop: '97px',
  });
});

it('leaves the layout alone while the page is pinch-zoomed', () => {
  expect(viewportToRootStyle({ height: 300, offsetTop: 40, scale: 2 })).toEqual(
    {
      height: '100%',
      offsetTop: '0px',
    },
  );
});
