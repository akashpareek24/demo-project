import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToHash from "./components/ScrollToHash";
import ScrollReveal from "./components/ScrollReveal";
import { startAuthListener } from "./store/slices/authSlice";
import { syncLibraryState } from "./store/slices/librarySlice";
import { HISTORY_EVENT, SAVED_EVENT } from "./lib/savedNews";
import { useAppDispatch } from "./store/hooks";

const TopPage = lazy(() => import("./pages/TopPage"));
const BreakingPage = lazy(() => import("./pages/BreakingPage"));
const IntelPage = lazy(() => import("./pages/IntelPage"));
const IndustryPage = lazy(() => import("./pages/IndustryPage"));
const WorldPage = lazy(() => import("./pages/WorldPage"));
const FeaturedPage = lazy(() => import("./pages/FeaturedPage"));
const NewsDetailPage = lazy(() => import("./pages/NewsDetailPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));

function RouteFallback() {
  return (
    <div className="container py-4">
      <div className="bg-white border rounded-4 shadow-sm p-4 text-center">
        <div className="fw-semibold mb-1">Loading</div>
        <div className="text-secondary small">Preparing page content...</div>
      </div>
    </div>
  );
}

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
        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>
      </main>

      {!isAuthRoute ? <Footer /> : null}
    </>
  );
}
