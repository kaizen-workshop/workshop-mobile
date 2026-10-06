export type FeedCard = Readonly<{
  id: string;
  kind: 'workshop' | 'post';
  title: string;
  imageUrl?: string;
  summary?: string;
  context?: string;
  highlighted?: boolean;
  relatedWorkshopId?: string;
  likeCount?: number;
  likedByMe?: boolean;
}>;
