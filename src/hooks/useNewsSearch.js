import { useEffect, useMemo } from "react";
import { runSearch } from "../store/slices/searchSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectSearchState } from "../store/selectors";

export function useNewsSearch(query, category = "all") {
  const dispatch = useAppDispatch();
  const searchState = useAppSelector(selectSearchState);

  const normalizedQuery = String(query || "").trim();
  const normalizedCategory = String(category || "all").toLowerCase();
  const loading = searchState.status === "loading" && normalizedQuery.length > 0;

  useEffect(() => {
    dispatch(runSearch({ query: normalizedQuery, category: normalizedCategory }));
  }, [dispatch, normalizedQuery, normalizedCategory]);

  const filtered = useMemo(() => {
    const items = Array.isArray(searchState.items) ? searchState.items : [];
    if (normalizedCategory === "all") return items;
    return items.filter((item) => item.category === normalizedCategory);
  }, [searchState.items, normalizedCategory]);

  const availableCategories = useMemo(() => {
    const items = Array.isArray(searchState.items) ? searchState.items : [];
    const set = new Set(items.map((item) => item.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [searchState.items]);

  const err = normalizedQuery ? searchState.err : "";
  return { items: filtered, loading, err, availableCategories };
}
