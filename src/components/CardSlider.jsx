import { useEffect, useMemo, useRef } from "react";
import { SmallTextCard } from "./CardBlocks";

export default function CardSlider({ items = [] }) {
  const list = useMemo(() => {
    const source = Array.isArray(items) ? items.filter(Boolean) : [];
    const seen = new Set();
    const out = [];
    source.forEach((item) => {
      const key = item?.url || item?.title || item?.id;
      if (!item || !key || seen.has(key)) return;
      seen.add(key);
      out.push(item);
    });
    return out;
  }, [items]);

  const shouldAnimate = list.length > 1;
  const trackRef = useRef(null);
  const firstGroupRef = useRef(null);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const offsetRef = useRef(0);
  const loopWidthRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    const firstGroup = firstGroupRef.current;

    if (!track || !firstGroup || !shouldAnimate) {
      if (track) track.style.transform = "translateX(0)";
      return undefined;
    }

    const SPEED_PX_PER_SEC = 34;

    const measure = () => {
      loopWidthRef.current = firstGroup.getBoundingClientRect().width || 0;
      if (loopWidthRef.current > 0) {
        offsetRef.current = offsetRef.current % loopWidthRef.current;
      } else {
        offsetRef.current = 0;
      }
      track.style.transform = `translateX(-${offsetRef.current}px)`;
    };

    const tick = (time) => {
      const prev = lastTimeRef.current || time;
      const deltaSec = (time - prev) / 1000;
      lastTimeRef.current = time;

      const width = loopWidthRef.current;
      if (width > 0) {
        offsetRef.current += SPEED_PX_PER_SEC * deltaSec;
        if (offsetRef.current >= width) {
          offsetRef.current -= width;
        }
        track.style.transform = `translateX(-${offsetRef.current}px)`;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(firstGroup);
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      lastTimeRef.current = 0;
    };
  }, [shouldAnimate, list.length]);

  if (!list.length) return null;

  return (
    <div className="story-slider-wrap">
      <div className="story-slider-viewport">
        <div className="story-slider-track" ref={trackRef}>
          <div className="story-slider-group" ref={firstGroupRef}>
            {list.map((item, idx) => (
              <div className="story-slider-slide" key={`${item.id || item.url || item.title}-a-${idx}`}>
                <SmallTextCard item={item} />
              </div>
            ))}
          </div>

          {shouldAnimate ? (
            <div className="story-slider-group" aria-hidden="true">
              {list.map((item, idx) => (
                <div className="story-slider-slide" key={`${item.id || item.url || item.title}-b-${idx}`}>
                  <SmallTextCard item={item} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
