import SectionLanding from "../components/SectionLanding";
import { useNewsFeed } from "../hooks/useNewsFeed";

export default function IntelPage() {
  const feed = useNewsFeed("intel");

  return (
    <SectionLanding
      title="Intel"
      description="Defense, cyber, AI, and intelligence desk coverage with explainers and source-linked updates."
      items={feed.items}
      err={feed.err}
      onLoadMore={feed.loadMore}
      hasMore={feed.hasMore}
      loadingMore={feed.loadingMore}
    />
  );
}
