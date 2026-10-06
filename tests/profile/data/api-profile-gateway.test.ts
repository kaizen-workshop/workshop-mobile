import { createApiProfileGateway } from '@/profile';

const storage = {
  read: jest
    .fn()
    .mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }),
  save: jest.fn(),
  clear: jest.fn(),
};
const profile = {
  id: 'user-1',
  name: 'Ana',
  username: 'ana',
  email: 'ana@example.com',
  phone: null,
  profileImage: null,
  themes: [{ id: 'theme-1', name: 'Lean' }],
};

it('loads and updates only the profile fields permitted by the API', async () => {
  const request = jest.fn().mockResolvedValue(profile);
  const gateway = createApiProfileGateway({ request }, storage);
  await expect(gateway.load()).resolves.toMatchObject({
    username: 'ana',
    themeNames: ['Lean'],
  });
  await gateway.update({ name: 'Ana Silva', phone: null, profileImage: null });
  expect(request).toHaveBeenNthCalledWith(2, {
    path: '/users/me',
    method: 'PATCH',
    body: { name: 'Ana Silva', phone: null, profileImage: null },
    headers: { Authorization: 'Bearer access' },
  });
});
