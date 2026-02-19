import { Link } from "react-router-dom";
import FeedLayout from "../components/FeedLayout";
import { BigCard, SmallImageCard } from "../components/CardBlocks";
import TrendingPanel from "../components/TrendingPanel";
import CardSlider from "../components/CardSlider";
import { useNewsFeed } from "../hooks/useNewsFeed";
import { prepareLandingSections } from "../utils/newsSections";

export default function TopPage() {
  const { items, err, loadMore, hasMore, loadingMore } = useNewsFeed("top");
  const { lead, editorPicks, topCards, insightCards, latestItems } = prepareLandingSections(items);

  return (
    <div className="container py-3 py-lg-4">
      {err ? <div className="alert alert-danger py-2 mb-3">{err}</div> : null}

      <section className="row g-3 mb-3 hero-sticky-row">
        <div className="col-12 col-xl-7 hero-sticky-main">{lead ? <BigCard item={lead} /> : null}</div>
        <div className="col-12 col-xl-5 d-grid gap-3 hero-sticky-side">
          <TrendingPanel items={editorPicks} />
        </div>
      </section>

      {topCards.length ? (
        <section className="row g-3 mb-4 top-mini-grid">
          {topCards.map((item, idx) => (
            <div key={item.id || item.url || `${item.title}-${idx}`} className="col-12 col-md-6 col-xl-3 d-flex">
              <SmallImageCard item={item} />
            </div>
          ))}
        </section>
      ) : null}

      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3 news-section-head">
          <h2 className="h5 mb-0 fw-bold news-section-title">In Focus & Opinion</h2>
          <div className="d-flex gap-3">
            <Link to="/featured" className="small text-decoration-none news-section-link">
              Focus
            </Link>
            <Link to="/intel" className="small text-decoration-none news-section-link">
              Opinion
            </Link>
          </div>
        </div>
        <CardSlider items={insightCards} />
      </section>

      <section className="border-top pt-3">
        <div className="d-flex justify-content-between align-items-center mb-3 news-section-head">
          <h2 className="h5 mb-0 fw-bold news-section-title">Latest News</h2>
          <span className="small text-secondary">Continuous feed</span>
        </div>

        <FeedLayout
          items={latestItems}
          showLead={false}
          onLoadMore={loadMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
          emptyTitle="Loading more stories"
          emptyText="Tap load more to fetch additional headlines."
        />
      </section>
    </div>
  );
}




