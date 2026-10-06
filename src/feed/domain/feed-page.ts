import type { FeedCard } from './feed-card';

export type FeedPage = Readonly<{
  items: readonly FeedCard[];
  page: number;
  hasMore: boolean;
}>;
