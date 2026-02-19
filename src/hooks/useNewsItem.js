import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EMPTY_FEED_STATE, fetchCategoryFirstPage } from "../store/slices/feedsSlice";

function toTokenSet(text = "") {
  return new Set(
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function scoreSimilarity(a, b) {
  const ta = toTokenSet(a);
  const tb = toTokenSet(b);
  if (!ta.size || !tb.size) return 0;
  let overlap = 0;
  ta.forEach((w) => {
    if (tb.has(w)) overlap += 1;
  });
  return overlap / Math.max(ta.size, tb.size);
}

export function useNewsItem({ id, category, seedItem = null, fallbackAll = [] }) {
  const dispatch = useDispatch();
  const resolvedCategory = category || "top";
  const feedState = useSelector((s) => s.feeds.byCategory[resolvedCategory] || EMPTY_FEED_STATE);
  const items = useMemo(() => (Array.isArray(feedState.items) ? feedState.items : []), [feedState.items]);
  const loading = feedState.status === "loading" || feedState.loadedCategory !== resolvedCategory;

  const fallbackNews = useMemo(() => {
    if (seedItem?.id === id) return seedItem;
    return fallbackAll.find((n) => n.id === id) || null;
  }, [id, seedItem, fallbackAll]);

  useEffect(() => {
    dispatch(fetchCategoryFirstPage(resolvedCategory));
  }, [dispatch, resolvedCategory]);

  const news = useMemo(() => {
    if (seedItem?.id === id) return seedItem;
    const hit = items.find((n) => n.id === id);
    return hit || fallbackNews;
  }, [seedItem, items, id, fallbackNews]);

  const related = useMemo(() => {
    if (!news) return [];
    const pool = (items.length ? items : fallbackAll).filter((n) => n.id !== news.id);
    const sameCategory = pool.filter((n) => n.category === news.category);
    const ranked = sameCategory
      .map((n) => ({
        item: n,
        score: scoreSimilarity(`${news.title} ${news.summary}`, `${n.title} ${n.summary}`),
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);

    return ranked.slice(0, 8);
  }, [items, fallbackAll, news]);

  return { news, related, loading };
}
