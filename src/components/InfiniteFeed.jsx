import { useMemo, useState } from "react";
import NewsCard from "./NewsCard";

export default function InfiniteFeed({
  items,
  chunkSize = 10,   // anchor distance
  tokens = 20,      // 1..20
  initial = 18,
  step = 12,
  variantPattern = ["highlight", "standard", "compact", "standard"],
}) {
  const [visible, setVisible] = useState(initial);

  // never-ending: repeat by modulo
  const feed = useMemo(() => {
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
          onClick={() => setVisible((v) => v + step)}
        >
          Load more
        </button>
      </div>
    </>
  );
}
