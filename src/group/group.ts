export type WorkshopGroup = Readonly<{
  id: string;
  workshopId: string;
  workshopTitle: string;
  active: boolean;
  canSendMessages: boolean;
  canModerate: boolean;
  updatedAt: string;
}>;

export type GroupPage = Readonly<{
  items: readonly WorkshopGroup[];
  page: number;
  hasMore: boolean;
}>;
