import { createSelector } from "@reduxjs/toolkit";
import { EMPTY_FEED_STATE } from "./slices/feedsSlice";

export const selectAuthState = (state) => state.auth;
export const selectFeedsState = (state) => state.feeds;
export const selectSearchState = (state) => state.search;
export const selectLibraryState = (state) => state.library;
export const selectUiState = (state) => state.ui;
export const selectAuthFormState = (state) => state.authForm;

export const selectAuthUser = createSelector([selectAuthState], (auth) => auth.user);
export const selectAuthReady = createSelector([selectAuthState], (auth) => auth.ready);

export const selectHeaderSearchOpen = createSelector([selectUiState], (ui) => ui.headerSearchOpen);
export const selectHeaderMoreOpen = createSelector([selectUiState], (ui) => ui.headerMoreOpen);
export const selectHeaderQuery = createSelector([selectUiState], (ui) => ui.headerQuery);
export const selectSearchCategory = createSelector([selectUiState], (ui) => ui.searchCategory);

export const selectFeedStateByCategory = (state, category) =>
  state.feeds.byCategory[category] || EMPTY_FEED_STATE;

export const selectFeedVisibleCountByKey = (state, key, fallback = 6) =>
  state.ui.feedVisibleByKey[key] ?? fallback;

export const selectSearchItems = createSelector([selectSearchState], (search) =>
  Array.isArray(search.items) ? search.items : []
);

export const selectSavedMap = createSelector([selectLibraryState], (library) => library.savedMap);
export const selectSavedList = createSelector([selectLibraryState], (library) =>
  Array.isArray(library.savedList) ? library.savedList : []
);
export const selectHistoryList = createSelector([selectLibraryState], (library) =>
  Array.isArray(library.historyList) ? library.historyList : []
);
