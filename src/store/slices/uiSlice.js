import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    headerSearchOpen: false,
    headerMoreOpen: false,
    searchCategory: "all",
  },
  reducers: {
    setHeaderSearchOpen(state, action) {
      state.headerSearchOpen = Boolean(action.payload);
    },
    setHeaderMoreOpen(state, action) {
      state.headerMoreOpen = Boolean(action.payload);
    },
    setSearchCategory(state, action) {
      state.searchCategory = String(action.payload || "all").toLowerCase();
    },
  },
});

export const {
  setHeaderSearchOpen,
  setHeaderMoreOpen,
  setSearchCategory,
} = uiSlice.actions;

export default uiSlice.reducer;
