import { render, screen } from '@testing-library/react-native';

import {
  coverFor,
  WorkshopCover,
} from '@/workshop/presentation/workshop-cover';

it('gives different workshops different covers', () => {
  const security = coverFor('Segurança no Ambiente Industrial', 'Segurança');
  const quality = coverFor('Qualidade na Prática', 'Qualidade');
  const leadership = coverFor('Liderança para Times', 'Liderança');
  expect(
    new Set([security.background, quality.background, leadership.background])
      .size,
  ).toBe(3);
});

it('is stable for the same workshop', () => {
  const first = coverFor('Oficina X');
  const second = coverFor('Oficina X');
  expect(second.background).toBe(first.background);
});

it('describes the cover for assistive technology', () => {
  render(<WorkshopCover theme="Segurança" title="NR-12" />);
  expect(screen.getByLabelText('Capa do workshop NR-12')).toBeTruthy();
  expect(screen.getByText('Segurança')).toBeTruthy();
});
