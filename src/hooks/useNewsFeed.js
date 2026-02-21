import { useCallback, useEffect } from "react";
import {
  fetchCategoryFirstPage,
  loadMoreCategoryPage,
  refreshCategoryPage,
} from "../store/slices/feedsSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectFeedStateByCategory } from "../store/selectors";

const REFRESH_MS = Math.max(30000, Number(import.meta.env.VITE_NEWS_REFRESH_MS || 180000));

export function useNewsFeed(category) {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => selectFeedStateByCategory(s, category));

  const {
    items,
    err,
    loadedCategory,
    loadingMore,
    hasMore,
    status,
  } = state;

  const loading = status === "loading" || loadedCategory !== category;

  useEffect(() => {
    dispatch(fetchCategoryFirstPage(category));
  }, [dispatch, category]);

  useEffect(() => {
    if (loadedCategory !== category) return;
    if (!Number.isFinite(REFRESH_MS) || REFRESH_MS <= 0) return;

    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      dispatch(refreshCategoryPage(category));
    }, REFRESH_MS);

    return () => clearInterval(timer);
  }, [category, loadedCategory, dispatch]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || !hasMore) return;
    dispatch(loadMoreCategoryPage(category));
  }, [dispatch, category, loadingMore, loading, hasMore]);

  return { items, loading, err, loadMore, hasMore, loadingMore };
}
