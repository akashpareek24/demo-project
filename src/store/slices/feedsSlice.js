import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchNewsByCategory } from "../../api/newsApi";

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

function mergeUnique(base = [], incoming = []) {
  const seen = new Set();
  const out = [];
  [...base, ...incoming].forEach((item) => {
    const key = getStoryKey(item);
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(item);
  });
  return out;
}

function initialCategoryState() {
  return {
    items: [],
    err: "",
    loadedCategory: null,
    page: 0,
    loadingMore: false,
    hasMore: true,
    status: "idle",
  };
}

export const EMPTY_FEED_STATE = Object.freeze(initialCategoryState());

export const fetchCategoryFirstPage = createAsyncThunk(
  "feeds/fetchCategoryFirstPage",
  async (category, { rejectWithValue }) => {
    try {
      const items = await fetchNewsByCategory(category, { page: 1 });
      return { category, items: Array.isArray(items) ? items : [] };
    } catch {
      return rejectWithValue({ category, error: "API error" });
    }
  }
);

export const refreshCategoryPage = createAsyncThunk(
  "feeds/refreshCategoryPage",
  async (category, { rejectWithValue }) => {
    try {
      const items = await fetchNewsByCategory(category, { page: 1, force: true });
      return { category, items: Array.isArray(items) ? items : [] };
    } catch {
      return rejectWithValue({ category, error: "API error" });
    }
  }
);

export const loadMoreCategoryPage = createAsyncThunk(
  "feeds/loadMoreCategoryPage",
  async (category, { getState, rejectWithValue }) => {
    const state = getState();
    const current = state.feeds.byCategory[category] || initialCategoryState();
    const nextPage = Math.max(1, Number(current.page || 0) + 1);

    try {
      const items = await fetchNewsByCategory(category, { page: nextPage });
      return { category, page: nextPage, items: Array.isArray(items) ? items : [] };
    } catch {
      return rejectWithValue({ category, error: "API error" });
    }
  }
);

const feedsSlice = createSlice({
  name: "feeds",
  initialState: {
    byCategory: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoryFirstPage.pending, (state, action) => {
        const category = action.meta.arg;
        const current = state.byCategory[category] || initialCategoryState();
        state.byCategory[category] = { ...current, status: "loading", err: "" };
      })
      .addCase(fetchCategoryFirstPage.fulfilled, (state, action) => {
        const { category, items } = action.payload;
        state.byCategory[category] = {
          items,
          err: "",
          loadedCategory: category,
          page: 1,
          loadingMore: false,
          hasMore: Boolean(items.length),
          status: "succeeded",
        };
      })
      .addCase(fetchCategoryFirstPage.rejected, (state, action) => {
        const { category, error } = action.payload || { category: action.meta.arg, error: "API error" };
        state.byCategory[category] = {
          ...(state.byCategory[category] || initialCategoryState()),
          items: [],
          err: error,
          loadedCategory: category,
          page: 1,
          loadingMore: false,
          hasMore: false,
          status: "failed",
        };
      })
      .addCase(refreshCategoryPage.fulfilled, (state, action) => {
        const { category, items } = action.payload;
        const current = state.byCategory[category] || initialCategoryState();
        state.byCategory[category] = {
          ...current,
          items: mergeUnique(current.items, items),
          err: "",
          loadedCategory: category,
          page: Math.max(current.page || 0, 1),
          hasMore: true,
          status: current.status === "idle" ? "succeeded" : current.status,
        };
      })
      .addCase(loadMoreCategoryPage.pending, (state, action) => {
        const category = action.meta.arg;
        const current = state.byCategory[category] || initialCategoryState();
        state.byCategory[category] = { ...current, loadingMore: true, err: "" };
      })
      .addCase(loadMoreCategoryPage.fulfilled, (state, action) => {
        const { category, page, items } = action.payload;
        const current = state.byCategory[category] || initialCategoryState();
        state.byCategory[category] = {
          ...current,
          items: items.length ? mergeUnique(current.items, items) : current.items,
          page: items.length ? page : current.page,
          hasMore: Boolean(items.length),
          loadingMore: false,
          err: "",
          loadedCategory: category,
        };
      })
      .addCase(loadMoreCategoryPage.rejected, (state, action) => {
        const { category, error } = action.payload || { category: action.meta.arg, error: "API error" };
        const current = state.byCategory[category] || initialCategoryState();
        state.byCategory[category] = {
          ...current,
          loadingMore: false,
          hasMore: false,
          err: error,
        };
      });
  },
});

export default feedsSlice.reducer;
