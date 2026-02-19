import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { searchNews } from "../../api/newsApi";

export const runSearch = createAsyncThunk(
  "search/runSearch",
  async ({ query, category }, { rejectWithValue }) => {
    const q = String(query || "").trim();
    const normalizedCategory = String(category || "all").toLowerCase();
    if (!q) {
      return {
        query: q,
        category: normalizedCategory,
        items: [],
      };
    }

    const providerCategory = normalizedCategory === "all" ? "" : normalizedCategory;
    try {
      const items = await searchNews(q, providerCategory);
      return {
        query: q,
        category: normalizedCategory,
        items: Array.isArray(items) ? items : [],
      };
    } catch {
      return rejectWithValue({
        query: q,
        category: normalizedCategory,
        error: "Live API unavailable.",
      });
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState: {
    query: "",
    category: "all",
    items: [],
    status: "idle",
    err: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(runSearch.pending, (state, action) => {
        const { query, category } = action.meta.arg || {};
        state.query = String(query || "").trim();
        state.category = String(category || "all").toLowerCase();
        state.status = state.query ? "loading" : "idle";
        state.err = "";
      })
      .addCase(runSearch.fulfilled, (state, action) => {
        const { query, category, items } = action.payload;
        state.query = query;
        state.category = category;
        state.items = items;
        state.status = "succeeded";
        state.err = items.length ? "" : "No matching stories found.";
      })
      .addCase(runSearch.rejected, (state, action) => {
        const payload = action.payload || {};
        state.query = payload.query || state.query;
        state.category = payload.category || state.category;
        state.items = [];
        state.status = "failed";
        state.err = payload.error || "Live API unavailable.";
      });
  },
});

export default searchSlice.reducer;
