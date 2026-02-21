import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToHash from "./components/ScrollToHash";
import ScrollReveal from "./components/ScrollReveal";

import TopPage from "./pages/TopPage";
import BreakingPage from "./pages/BreakingPage";
import IntelPage from "./pages/IntelPage";
import IndustryPage from "./pages/IndustryPage";
import WorldPage from "./pages/WorldPage";
import FeaturedPage from "./pages/FeaturedPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import SearchPage from "./pages/SearchPage";
import AuthPage from "./pages/AuthPage";
import AccountPage from "./pages/AccountPage";
import { startAuthListener } from "./store/slices/authSlice";
import { syncLibraryState } from "./store/slices/librarySlice";
import { HISTORY_EVENT, SAVED_EVENT } from "./lib/savedNews";
import { useAppDispatch } from "./store/hooks";

export default function App() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith("/auth");

  useEffect(() => {
    dispatch(startAuthListener());
    dispatch(syncLibraryState());

    const sync = () => dispatch(syncLibraryState());
    window.addEventListener("storage", sync);
    window.addEventListener(SAVED_EVENT, sync);
    window.addEventListener(HISTORY_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(SAVED_EVENT, sync);
      window.removeEventListener(HISTORY_EVENT, sync);
    };
  }, [dispatch]);

  return (
    <>
      <ScrollToHash />
      {!isAuthRoute ? <ScrollReveal /> : null}
      {!isAuthRoute ? <Header /> : null}

      <main className="site-main">
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/breaking" element={<BreakingPage />} />
          <Route path="/intel" element={<IntelPage />} />
          <Route path="/industry" element={<IndustryPage />} />
          <Route path="/world" element={<WorldPage />} />
          <Route path="/featured" element={<FeaturedPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthRoute ? <Footer /> : null}
    </>
  );
}
