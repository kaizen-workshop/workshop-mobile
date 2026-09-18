import { render, screen } from '@testing-library/react-native';

import Index from '../../app/index';

it('renders the technical foundation screen', () => {
  render(<Index />);

  expect(screen.getByText('Fundação pronta')).toBeTruthy();
});
