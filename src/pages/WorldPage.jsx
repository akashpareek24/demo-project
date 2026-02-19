import SectionLanding from "../components/SectionLanding";
import { useNewsFeed } from "../hooks/useNewsFeed";

export default function WorldPage() {
  const feed = useNewsFeed("world");

  return (
    <SectionLanding
      title="World"
      description="Global affairs, diplomacy, policy, and humanitarian updates curated in a newsroom format."
      items={feed.items}
      err={feed.err}
      onLoadMore={feed.loadMore}
      hasMore={feed.hasMore}
      loadingMore={feed.loadingMore}
    />
  );
}
