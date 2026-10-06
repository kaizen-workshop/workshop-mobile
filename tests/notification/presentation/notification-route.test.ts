import { resolveNotificationData } from '@/notification/presentation';
it.each([
  [{ workshopId: 'workshop-1' }, '/(authenticated)/workshops/[id]'],
  [{ postId: 'post-1' }, '/(authenticated)/posts/[id]/comments'],
  [{ groupId: 'group-1' }, '/(authenticated)/groups/[id]'],
] as const)(
  'resolves safe internal notification metadata',
  (data, pathname) => {
    expect(resolveNotificationData(data)).toMatchObject({ pathname });
  },
);
it('does not navigate without a supported resource id', () => {
  expect(
    resolveNotificationData({ registrationId: 'registration-1' }),
  ).toBeUndefined();
});
