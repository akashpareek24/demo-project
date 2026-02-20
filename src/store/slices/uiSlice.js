import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    headerSearchOpen: false,
    headerMoreOpen: false,
    headerQuery: "",
    searchCategory: "all",
    feedVisibleByKey: {},
  },
  reducers: {
    setHeaderSearchOpen(state, action) {
      state.headerSearchOpen = Boolean(action.payload);
    },
    setHeaderMoreOpen(state, action) {
      state.headerMoreOpen = Boolean(action.payload);
    },
    setHeaderQuery(state, action) {
      state.headerQuery = String(action.payload || "");
    },
    setSearchCategory(state, action) {
      state.searchCategory = String(action.payload || "all").toLowerCase();
    },
    setFeedVisibleCount(state, action) {
      const { key, count } = action.payload || {};
      if (!key) return;
      state.feedVisibleByKey[key] = Math.max(0, Number(count || 0));
    },
    incrementFeedVisibleCount(state, action) {
      const { key, step = 0, base = 0 } = action.payload || {};
      if (!key) return;
      const current = Number(state.feedVisibleByKey[key] || base || 0);
      state.feedVisibleByKey[key] = Math.max(0, current + Number(step || 0));
    },
  },
});

export const {
  setHeaderSearchOpen,
  setHeaderMoreOpen,
  setHeaderQuery,
  setSearchCategory,
  setFeedVisibleCount,
  incrementFeedVisibleCount,
} = uiSlice.actions;

export default uiSlice.reducer;
