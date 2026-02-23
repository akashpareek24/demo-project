import { useEffect, useMemo } from "react";
import NewsCard from "./NewsCard";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { incrementFeedVisibleCount, setFeedVisibleCount } from "../store/slices/uiSlice";
import { selectFeedVisibleCountByKey } from "../store/selectors";

export default function InfiniteFeed({
  items,
  chunkSize = 10,   // anchor distance
  tokens = 20,      // 1..20
  initial = 18,
  step = 12,
  feedKey = "infinite-feed",
  variantPattern = ["highlight", "standard", "compact", "standard"],
}) {
  const dispatch = useAppDispatch();
  const visibleInStore = useAppSelector((s) => selectFeedVisibleCountByKey(s, feedKey, undefined));
  const visible = visibleInStore ?? initial;

  useEffect(() => {
    if (visibleInStore !== undefined) return;
    dispatch(setFeedVisibleCount({ key: feedKey, count: initial }));
  }, [dispatch, feedKey, initial, visibleInStore]);

  // never-ending: repeat by modulo
  const feed = useMemo(() => {
    if (!Array.isArray(items) || !items.length) return [];
    const out = [];
    for (let i = 0; i < visible; i++) {
      out.push(items[i % items.length]);
    }
    return out;
  }, [items, visible]);

  return (
    <>
      <div className="row g-3">
        {feed.map((item, idx) => {
          const anchorIndex = Math.floor(idx / chunkSize) + 1;
          const shouldAnchor = idx % chunkSize === 0 && anchorIndex <= tokens;

          const variant = variantPattern[idx % variantPattern.length];

          return (
            <div key={`${item.id}-${idx}`} className="col-12 col-md-6 col-lg-4">
              {shouldAnchor && <div id={`section-${anchorIndex}`} />}
              <NewsCard item={item} variant={variant} />
            </div>
          );
        })}
      </div>

      <div className="d-flex justify-content-center mt-4">
        <button
          className="btn btn-outline-secondary fw-semibold px-4"
          onClick={() => dispatch(incrementFeedVisibleCount({ key: feedKey, step, base: initial }))}
        >
          Load more
        </button>
      </div>
    </>
  );
}
