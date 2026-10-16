import { render, screen } from '@testing-library/react-native';

import { DashboardScreen } from '@/admin';

const dashboard = {
  workshops: 3,
  publishedWorkshops: 2,
  registrations: 10,
  confirmedRegistrations: 6,
  waitingListRegistrations: 1,
  attendedRegistrations: 0,
};

function setup(
  upcomingPosts?: React.ComponentProps<typeof DashboardScreen>['upcomingPosts'],
) {
  render(
    <DashboardScreen
      dashboard={dashboard}
      onCreateAnnouncement={jest.fn()}
      onCreatePost={jest.fn()}
      onCreateWorkshop={jest.fn()}
      onOpenPosts={jest.fn()}
      onOpenWorkshops={jest.fn()}
      onRetry={jest.fn()}
      status="success"
      upcomingPosts={upcomingPosts}
    />,
  );
}

it('shows scheduled posts under "Próximas publicações"', () => {
  setup([
    {
      id: 'p1',
      title: 'Semana da Qualidade',
      content: 'x',
      status: 'SCHEDULED',
      highlight: false,
      scheduledAt: '2026-10-20T11:00:00Z',
    },
  ]);
  expect(screen.getByText('Próximas publicações')).toBeTruthy();
  expect(screen.getByText('Semana da Qualidade')).toBeTruthy();
  expect(screen.getByText(/Sai no feed em/)).toBeTruthy();
});

it('hides the block when nothing is scheduled', () => {
  setup([]);
  expect(screen.queryByText('Próximas publicações')).toBeNull();
  expect(screen.getByText('Visão geral')).toBeTruthy();
});
