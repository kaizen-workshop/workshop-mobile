export type ChatMessage = Readonly<{
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  content: string | null;
  sentAt: string;
  editedAt: string | null;
  deletedAt: string | null;
}>;
export type MessagePage = Readonly<{
  items: readonly ChatMessage[];
  nextCursor?: string;
  hasMore: boolean;
}>;
