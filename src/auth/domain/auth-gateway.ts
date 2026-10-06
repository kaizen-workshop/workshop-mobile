export type AuthSession = Readonly<{
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
  requiresOnboarding: boolean;
}>;

export type AuthGateway = Readonly<{
  login(input: { login: string; password: string }): Promise<AuthSession>;
  refresh(refreshToken: string): Promise<AuthSession>;
  changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void>;
  requestPasswordRecovery(login: string): Promise<void>;
  resetPassword(input: { code: string; password: string }): Promise<void>;
  logout(refreshToken: string): Promise<void>;
}>;
