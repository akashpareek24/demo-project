import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getStoryKey } from "../lib/savedNews";
import { toggleSavedStoryState } from "../store/slices/librarySlice";

function createViewLabel(item = {}, idx = 0) {
  const seed = [item.id, item.url, item.title, item.date, idx].filter(Boolean).join("|");
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }

  const views = 900 + (hash % 4200);
  return views >= 1000 ? `${(views / 1000).toFixed(1)}K` : `${views}`;
}

export default function TrendingPanel({ items = [] }) {
  const dispatch = useDispatch();
  const savedStories = useSelector((s) => s.library.savedMap);
  const list = useMemo(() => {
    const source = Array.isArray(items) ? items.filter(Boolean) : [];
    return source.slice(0, 9);
  }, [items]);

  const toggleSave = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    const key = getStoryKey(item);
    if (!key) return;
    dispatch(toggleSavedStoryState(item));
  };

  return (
    <section className="card border rounded-0 h-100 news-panel trending-panel">
      <div className="card-header bg-white news-panel-head">
        <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
          <div>
            <div className="trending-kicker">Live News Board</div>
            <div className="trending-title">News Pulse</div>
            <div className="trending-subtitle">Fast-moving stories people are reading now</div>
          </div>
          <span className="trending-live-badge">LIVE</span>
        </div>
        <div className="d-flex gap-2 mt-2 flex-wrap">
          <span className="trending-chip active">Most Read</span>
          <span className="trending-chip">Editors&apos; Picks</span>
          <span className="trending-chip">Watchlist</span>
        </div>
      </div>

      <div className="list-group list-group-flush">
        {list.map((item, idx) => {
          const storyKey = getStoryKey(item);
          const isSaved = Boolean(storyKey && savedStories[storyKey]);

          return (
            <Link
              key={`${item.id}-${idx}`}
              to={`/news/${item.id}`}
              state={{ item }}
              className="list-group-item list-group-item-action text-decoration-none text-dark trending-item"
            >
              <div className="d-flex align-items-start gap-2">
                <span className="trending-rank">{idx + 1}.</span>
                <div className="flex-grow-1">
                  <div className="fw-semibold clamp-2">{item.title}</div>
                  <div className="small text-secondary mt-1">
                    <span className="trending-meta-dot" />
                    {createViewLabel(item, idx)} views in the past hour
                  </div>
                </div>
                <button
                  type="button"
                  className={`trending-save-mark ${isSaved ? "saved" : ""}`}
                  aria-label={isSaved ? "Unsave story" : "Save story"}
                  aria-pressed={isSaved}
                  onClick={(event) => toggleSave(event, item)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M12 2.7l2.86 5.79 6.39.93-4.62 4.5 1.09 6.36L12 17.3l-5.72 3.01 1.1-6.36-4.63-4.5 6.39-.93L12 2.7z" />
                  </svg>
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
