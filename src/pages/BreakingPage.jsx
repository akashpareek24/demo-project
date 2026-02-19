import SectionLanding from "../components/SectionLanding";
import { useNewsFeed } from "../hooks/useNewsFeed";

export default function BreakingPage() {
  const feed = useNewsFeed("breaking");

  return (
    <SectionLanding
      title="Breaking"
      description="Verified developing stories, live updates, and rapid context from correspondents across regions."
      items={feed.items}
      err={feed.err}
      onLoadMore={feed.loadMore}
      hasMore={feed.hasMore}
      loadingMore={feed.loadingMore}
    />
  );
}
