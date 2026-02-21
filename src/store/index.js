import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import feedsReducer from "./slices/feedsSlice";
import searchReducer from "./slices/searchSlice";
import libraryReducer from "./slices/librarySlice";
import uiReducer from "./slices/uiSlice";
import authFormReducer from "./slices/authFormSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    feeds: feedsReducer,
    search: searchReducer,
    library: libraryReducer,
    ui: uiReducer,
    authForm: authFormReducer,
  },
  devTools: import.meta.env.DEV,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
