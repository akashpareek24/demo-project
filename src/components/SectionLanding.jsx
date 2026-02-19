import { Link } from "react-router-dom";
import FeedLayout from "./FeedLayout";
import { BigCard, SmallImageCard } from "./CardBlocks";
import TrendingPanel from "./TrendingPanel";
import CardSlider from "./CardSlider";
import { prepareLandingSections } from "../utils/newsSections";

export default function SectionLanding({
  items,
  err,
  onLoadMore,
  hasMore,
  loadingMore,
}) {
  const { lead, editorPicks, topCards, insightCards, latestItems } = prepareLandingSections(items);

  return (
    <div className="container py-3 py-lg-4">
      {err ? <div className="alert alert-danger py-2 mb-3">{err}</div> : null}

      <section className="row g-3 mb-3 hero-sticky-row">
        <div className="col-12 col-xl-7 hero-sticky-main">
          {lead ? <BigCard item={lead} /> : null}
        </div>

        <div className="col-12 col-xl-5 d-grid gap-3 hero-sticky-side">
          <TrendingPanel items={editorPicks} />
        </div>
      </section>

      {topCards.length ? (
        <section className="row g-3 mb-4 top-mini-grid">
          {topCards.map((item, idx) => (
            <div className="col-12 col-md-6 col-xl-3 d-flex" key={item.id || item.url || `${item.title}-${idx}`}>
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
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
          emptyTitle="Loading more stories"
          emptyText="Tap load more to fetch additional headlines."
        />
      </section>
    </div>
  );
}


