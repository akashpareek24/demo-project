import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { BigCard, SmallImageCard, SmallTextCard } from "./CardBlocks";
import { incrementFeedVisibleCount, setFeedVisibleCount } from "../store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectFeedVisibleCountByKey } from "../store/selectors";

function normalizeKey(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\w\s]|_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getStoryKey(item = {}) {
  const title = normalizeKey(item?.title || "");
  const date = normalizeKey(item?.date || "");
  const source = normalizeKey(item?.author || item?.region || "");
  if (title) return `t:${title}|${date}|${source}`;

  const url = normalizeKey(item?.url || "");
  if (url) return `u:${url}`;

  const image = normalizeKey(item?.image?.src || "");
  return image ? `i:${image}` : "";
}

export default function FeedLayout({
  items,
  onLoadMore,
  hasMore = true,
  loadingMore = false,
  showLead = true,
  paginate = true,
  feedKey = "",
  emptyTitle = "No stories found",
  emptyText = "Try another keyword or category.",
}) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const CARDS_PER_ROW = 3;
  const BATCH_CARDS = 6;
  const resolvedFeedKey = feedKey || `${location.pathname}::${showLead ? "lead" : "grid"}::${paginate ? "paged" : "full"}`;
  const visibleCountInStore = useAppSelector((s) => selectFeedVisibleCountByKey(s, resolvedFeedKey, undefined));
  const visibleCount = visibleCountInStore ?? BATCH_CARDS;
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  useEffect(() => {
    if (!paginate || visibleCountInStore !== undefined) return;
    dispatch(setFeedVisibleCount({ key: resolvedFeedKey, count: BATCH_CARDS }));
  }, [dispatch, paginate, resolvedFeedKey, visibleCountInStore]);

  if (!safeItems.length) {
    return (
      <div className="bg-white border rounded-4 shadow-sm p-4 text-center reveal">
        <div className="fw-semibold mb-1">{emptyTitle}</div>
        <div className="text-secondary small">{emptyText}</div>
      </div>
    );
  }

  const feed = [];
  const feedSeen = new Set();
  safeItems.forEach((base) => {
    const mapped = {
      ...base,
      region: base.region || "World",
      tag: base.tag || (base.category ? String(base.category).toUpperCase() : "TOP"),
      summary: base.summary || "Open to read details.",
      readTime: base.readTime || "5 min read",
      author: base.author || "News Desk",
      date: base.date || "-",
    };
    const key = getStoryKey(mapped);
    if (!key || feedSeen.has(key)) return;
    feedSeen.add(key);
    feed.push(mapped);
  });

  const leadStory = showLead ? feed[0] || null : null;
  const topSide = showLead ? feed.slice(1, 3) : [];
  const rest = showLead ? feed.slice(3) : feed;
  const maxRenderable = paginate ? Math.floor(rest.length / CARDS_PER_ROW) * CARDS_PER_ROW : rest.length;
  const renderCount = Math.min(visibleCount, maxRenderable);
  const renderItems = paginate ? rest.slice(0, renderCount) : rest;

  const rows = [];
  for (let i = 0; i < renderItems.length; i += CARDS_PER_ROW) {
    rows.push(renderItems.slice(i, i + CARDS_PER_ROW));
  }

  return (
    <>
      {showLead && leadStory ? (
        <section className="lead-grid mb-4">
          <div className="row g-3">
            <div className="col-12 col-lg-8 d-flex">
              <BigCard item={leadStory} />
            </div>
            <div className="col-12 col-lg-4 d-grid gap-3">
              {topSide.map((item, idx) => (
                <SmallTextCard key={`${item.id}-lead-${idx}`} item={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="d-grid gap-3 feed-grid">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="row g-3 trio-row reveal">
            {row.map((item, colIndex) => (
              <div
                key={`${item.id}-${rowIndex}-${colIndex}`}
                className={`col-12 col-md-4 d-flex ${colIndex === 1 ? "feed-col-center" : "feed-col-side"}`}
              >
                <SmallImageCard item={item} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {paginate ? (
        <div className="d-flex justify-content-center mt-4">
          <button
            className="btn btn-outline-secondary px-4 fw-semibold load-more-btn"
            onClick={() => {
              const nextVisibleCount = visibleCount + BATCH_CARDS;
              if (nextVisibleCount > maxRenderable && onLoadMore && hasMore && !loadingMore) onLoadMore();
              dispatch(incrementFeedVisibleCount({ key: resolvedFeedKey, step: BATCH_CARDS, base: BATCH_CARDS }));
            }}
            disabled={loadingMore || (!hasMore && renderCount >= maxRenderable)}
          >
            {loadingMore ? "Loading..." : !hasMore && renderCount >= maxRenderable ? "No more news" : "Load more"}
          </button>
        </div>
      ) : null}
    </>
  );
}
