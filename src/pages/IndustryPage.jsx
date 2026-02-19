import SectionLanding from "../components/SectionLanding";
import { useNewsFeed } from "../hooks/useNewsFeed";

export default function IndustryPage() {
  const feed = useNewsFeed("industry");

  return (
    <SectionLanding
      title="Industry"
      description="Markets, policy, startups, and business strategy stories with enterprise impact tracking."
      items={feed.items}
      err={feed.err}
      onLoadMore={feed.loadMore}
      hasMore={feed.hasMore}
      loadingMore={feed.loadingMore}
    />
  );
}
