export type PostComment = Readonly<{
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}>;
export type CommentPage = Readonly<{
  items: readonly PostComment[];
  page: number;
  hasMore: boolean;
}>;
