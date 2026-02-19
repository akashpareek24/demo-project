import { createSlice } from "@reduxjs/toolkit";
import {
  getReadingHistory,
  getSavedStoriesList,
  pushReadingHistory,
  readSavedMap,
  toggleSavedStory,
} from "../../lib/savedNews";

const librarySlice = createSlice({
  name: "library",
  initialState: {
    savedMap: {},
    savedList: [],
    historyList: [],
  },
  reducers: {
    syncLibraryState(state) {
      state.savedMap = readSavedMap();
      state.savedList = getSavedStoriesList(60);
      state.historyList = getReadingHistory(60);
    },
    setSavedMap(state, action) {
      state.savedMap = action.payload || {};
      state.savedList = getSavedStoriesList(60);
    },
    setHistoryList(state, action) {
      state.historyList = Array.isArray(action.payload) ? action.payload : [];
    },
  },
});

export const { syncLibraryState, setSavedMap, setHistoryList } = librarySlice.actions;

export const toggleSavedStoryState = (item) => (dispatch) => {
  const next = toggleSavedStory(item);
  dispatch(setSavedMap(next));
};

export const pushReadingHistoryState = (item) => (dispatch) => {
  const next = pushReadingHistory(item);
  dispatch(setHistoryList(next));
};

export default librarySlice.reducer;
