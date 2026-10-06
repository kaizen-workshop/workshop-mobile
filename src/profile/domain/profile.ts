export type UserProfile = Readonly<{
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  profileImage?: string;
  themeNames: readonly string[];
}>;

export type ProfileUpdate = Readonly<{
  name: string;
  phone: string | null;
  profileImage: string | null;
}>;
