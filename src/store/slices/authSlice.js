import { createSlice } from "@reduxjs/toolkit";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "../../lib/firebase";

function toAuthUser(user) {
  if (!user) return null;
  return {
    uid: user.uid || "",
    email: user.email || "",
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
  };
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    ready: false,
  },
  reducers: {
    setAuthUser(state, action) {
      state.user = action.payload || null;
    },
    setAuthReady(state, action) {
      state.ready = Boolean(action.payload);
    },
  },
});

let authUnsubscribe = null;

export const { setAuthUser, setAuthReady } = authSlice.actions;

export const startAuthListener = () => (dispatch) => {
  if (!isFirebaseConfigured) {
    dispatch(setAuthReady(true));
    return;
  }
  if (authUnsubscribe) return;

  const auth = getFirebaseAuth();
  authUnsubscribe = onAuthStateChanged(auth, (user) => {
    dispatch(setAuthUser(toAuthUser(user)));
    dispatch(setAuthReady(true));
  });
};

export const stopAuthListener = () => () => {
  if (!authUnsubscribe) return;
  authUnsubscribe();
  authUnsubscribe = null;
};

export const applyAuthUser = (firebaseUser) => (dispatch) => {
  dispatch(setAuthUser(toAuthUser(firebaseUser)));
  dispatch(setAuthReady(true));
};

export const logoutUser = () => async (dispatch) => {
  if (!isFirebaseConfigured) return;
  await signOut(getFirebaseAuth());
  dispatch(setAuthUser(null));
};

export default authSlice.reducer;
