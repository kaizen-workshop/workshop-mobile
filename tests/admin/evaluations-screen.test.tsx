import { render, screen } from '@testing-library/react-native';

import { EvaluationsScreen, formatAverage } from '@/admin';

const summary = {
  total: 2,
  averageRating: 4.5,
  averageContentRating: 4,
  averageInstructorRating: null,
  averageOrganizationRating: 5,
};

it('formats averages with a decimal comma and a dash when empty', () => {
  expect(formatAverage(4.5)).toBe('4,5');
  expect(formatAverage(null)).toBe('—');
});

it('shows the summary and only the written comments', () => {
  render(
    <EvaluationsScreen
      evaluations={[
        {
          id: 'e1',
          rating: 5,
          contentRating: 5,
          instructorRating: 5,
          organizationRating: 5,
          comment: 'Excelente!',
          createdAt: '2026-10-01T10:00:00Z',
        },
        {
          id: 'e2',
          rating: 4,
          contentRating: 3,
          instructorRating: 4,
          organizationRating: 5,
          comment: '  ',
          createdAt: '2026-10-01T10:00:00Z',
        },
      ]}
      onRetry={jest.fn()}
      status="success"
      summary={summary}
      title="Lean"
    />,
  );
  expect(screen.getByText('2 respostas')).toBeTruthy();
  expect(screen.getByLabelText('Experiência geral: 4,5 de 5')).toBeTruthy();
  expect(screen.getByLabelText('Instrutor: — de 5')).toBeTruthy();
  expect(screen.getByText('Comentários (1)')).toBeTruthy();
  expect(screen.getByText('Excelente!')).toBeTruthy();
});

it('explains when nobody has evaluated yet', () => {
  render(
    <EvaluationsScreen
      evaluations={[]}
      onRetry={jest.fn()}
      status="success"
      summary={{ ...summary, total: 0, averageRating: null }}
      title="Lean"
    />,
  );
  expect(screen.getByText(/Ainda não há avaliações/)).toBeTruthy();
});
