import SectionLanding from "../components/SectionLanding";
import { useNewsFeed } from "../hooks/useNewsFeed";

export default function FeaturedPage() {
  const feed = useNewsFeed("featured");

  return (
    <SectionLanding
      title="Featured"
      description="Long reads, interviews, investigations, and curated analysis from our editorial team."
      items={feed.items}
      err={feed.err}
      onLoadMore={feed.loadMore}
      hasMore={feed.hasMore}
      loadingMore={feed.loadingMore}
    />
  );
}
