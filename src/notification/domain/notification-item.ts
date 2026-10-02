export type NotificationItem = Readonly<{
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data: Readonly<Record<string, string>>;
  createdAt: string;
}>;

export type NotificationPage = Readonly<{
  items: readonly NotificationItem[];
  page: number;
  hasMore: boolean;
}>;
