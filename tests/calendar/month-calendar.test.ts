import {
  buildMonthGrid,
  monthHeading,
  monthRange,
  occursOn,
  selectedDayTitle,
} from '@/calendar/month-calendar';

it('builds whole Sunday-first weeks around the month', () => {
  const grid = buildMonthGrid(2026, 8); // setembro de 2026
  expect(grid).toHaveLength(35);
  expect(grid[0]).toEqual({ date: '2026-08-30', day: 30, inMonth: false });
  expect(grid[2]).toEqual({ date: '2026-09-01', day: 1, inMonth: true });
  expect(grid.at(-1)).toEqual({ date: '2026-10-03', day: 3, inMonth: false });
});

it('titles the selected day in Portuguese', () => {
  expect(selectedDayTitle('2026-09-11')).toBe('Sexta-feira, 11 de setembro');
});

it('matches multi-day workshops on every day they span', () => {
  const item = { startDate: '2026-09-19', endDate: '2026-09-20' };
  expect(occursOn(item, '2026-09-19')).toBe(true);
  expect(occursOn(item, '2026-09-20')).toBe(true);
  expect(occursOn(item, '2026-09-21')).toBe(false);
});

it('computes the month range and history heading', () => {
  expect(monthRange(2026, 8)).toEqual({ from: '2026-09-01', to: '2026-09-30' });
  expect(monthHeading('2026-08-26')).toBe('Agosto de 2026');
});
