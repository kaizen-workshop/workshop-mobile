import { FeedScreen } from '@/feed/presentation';

export default function FeedRoute() {
  return <FeedScreen items={[]} onRefresh={() => undefined} status="error" />;
}
