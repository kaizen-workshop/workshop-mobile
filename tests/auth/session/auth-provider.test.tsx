import { renderHook, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/auth/session/auth-provider';

it('exposes unauthenticated state when secure storage is empty', async () => {
  const gateway = { login: jest.fn(), refresh: jest.fn(), logout: jest.fn() };
  const tokens = {
    read: jest.fn().mockResolvedValue(null),
    save: jest.fn(),
    clear: jest.fn(),
  };
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider gateway={gateway as never} tokenStorage={tokens}>
      {children}
    </AuthProvider>
  );
  const { result } = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(result.current.state).toBe('UNAUTHENTICATED'));
});
