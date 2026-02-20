import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "signup",
  email: "",
  name: "",
  password: "",
  submitted: false,
  submitting: false,
  error: "",
  successText: "",
};

const authFormSlice = createSlice({
  name: "authForm",
  initialState,
  reducers: {
    resetAuthFormState() {
      return { ...initialState };
    },
    setAuthFormMode(state, action) {
      state.mode = action.payload === "login" ? "login" : "signup";
    },
    setAuthFormEmail(state, action) {
      state.email = String(action.payload || "");
    },
    setAuthFormName(state, action) {
      state.name = String(action.payload || "");
    },
    setAuthFormPassword(state, action) {
      state.password = String(action.payload || "");
    },
    setAuthFormSubmitted(state, action) {
      state.submitted = Boolean(action.payload);
    },
    setAuthFormSubmitting(state, action) {
      state.submitting = Boolean(action.payload);
    },
    setAuthFormError(state, action) {
      state.error = String(action.payload || "");
    },
    setAuthFormSuccessText(state, action) {
      state.successText = String(action.payload || "");
    },
  },
});

export const {
  resetAuthFormState,
  setAuthFormMode,
  setAuthFormEmail,
  setAuthFormName,
  setAuthFormPassword,
  setAuthFormSubmitted,
  setAuthFormSubmitting,
  setAuthFormError,
  setAuthFormSuccessText,
} = authFormSlice.actions;

export default authFormSlice.reducer;
