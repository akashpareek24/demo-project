import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import searchIcon from "bootstrap-icons/icons/search.svg";
import closeIcon from "bootstrap-icons/icons/x-lg.svg";
import menuIcon from "bootstrap-icons/icons/list.svg";
import { logoutUser } from "../store/slices/authSlice";
import { setHeaderMoreOpen, setHeaderSearchOpen } from "../store/slices/uiSlice";

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = useSelector((s) => s.auth.user);
  const searchOpen = useSelector((s) => s.ui.headerSearchOpen);
  const moreOpen = useSelector((s) => s.ui.headerMoreOpen);
  const [query, setQuery] = useState(() => new URLSearchParams(location.search).get("q") || "");
  const searchInputRef = useRef(null);
  const moreBtnRef = useRef(null);

  const links = [
    { label: "Top", to: "/" },
    { label: "Breaking News", to: "/breaking" },
    { label: "Intel", to: "/intel" },
    { label: "Industry", to: "/industry" },
    { label: "World News", to: "/world" },
    { label: "Featured", to: "/featured" },
  ];
  const categories = ["Economy", "Technology", "Politics", "Culture", "Energy", "Defense", "Startups", "Climate"];

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    dispatch(setHeaderSearchOpen(false));
    closeOffcanvasById("mobileNav");
  };

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const btn = moreBtnRef.current;
    if (!btn) return;

    const onShown = () => dispatch(setHeaderMoreOpen(true));
    const onHidden = () => dispatch(setHeaderMoreOpen(false));

    btn.addEventListener("shown.bs.dropdown", onShown);
    btn.addEventListener("hidden.bs.dropdown", onHidden);

    return () => {
      btn.removeEventListener("shown.bs.dropdown", onShown);
      btn.removeEventListener("hidden.bs.dropdown", onHidden);
    };
  }, [dispatch]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const userInitial = (authUser?.displayName?.trim()?.[0] || authUser?.email?.[0] || "U").toUpperCase();
  const userName = authUser?.displayName?.trim() || "Global Wire Reader";

  const onLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate("/");
    } catch {
      // no-op
    }
  };

  const closeOffcanvasById = (id) => {
    const panelEl = document.getElementById(id);
    const offcanvasApi = window.bootstrap?.Offcanvas;
    if (!panelEl || !offcanvasApi) return;
    offcanvasApi.getOrCreateInstance(panelEl).hide();
  };

  const openAccountTab = (tab) => {
    navigate(`/account?tab=${encodeURIComponent(tab)}`);
    closeOffcanvasById("profilePanel");
  };

  const navigateFromMobile = (event, path) => {
    if (event) event.preventDefault();
    window.location.assign(path);
  };

  return (
    <header className="site-header sticky-top classic-header">
      <div className="utility-bar border-bottom">
        <div className="container d-flex justify-content-between align-items-center gap-2 py-1 small classic-utility">
          <span className="text-secondary d-inline-flex align-items-center gap-2">
            <span className="live-dot" />
            Live Desk
          </span>
          <span className="text-secondary">{today}</span>
          <span className="text-secondary d-none d-md-inline">Global Edition | Culture | Markets | Sport</span>
        </div>
      </div>

      <div className="container">
        <div className={`d-flex align-items-center justify-content-between py-2 gap-2 header-inner ${searchOpen ? "search-open" : ""}`}>
          {!searchOpen ? (
            <>
              <button
                className="btn border-0 shadow-none d-xl-none mobile-menu-btn"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#mobileNav"
                aria-controls="mobileNav"
                aria-label="Open menu"
              >
                <img src={menuIcon} alt="" className="bi-svg-icon dark-icon" aria-hidden="true" />
              </button>

              <NavLink to="/" className="text-decoration-none d-flex align-items-center gap-2 brand-wrap mx-auto flex-grow-1 justify-content-center">
                <span className="fw-bold d-flex align-items-center brand-name">
                  <img
                    src={Logo}
                    alt="GlobalWire Logo"
                    className="logo-img classic-logo-img"
                    loading="eager"
                    fetchPriority="high"
                    decoding="sync"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span className="brand-wordmark">The Global Wire</span>
                </span>
              </NavLink>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="d-inline-flex align-items-center justify-content-center search-icon-btn header-action-btn"
                  type="button"
                  aria-label="Open search"
                  onClick={() => dispatch(setHeaderSearchOpen(true))}
                >
                  <img src={searchIcon} alt="" className="bi-svg-icon dark-icon" aria-hidden="true" />
                </button>
                {authUser ? (
                  <div className="d-none d-sm-block">
                    <button
                      className="d-inline-flex align-items-center justify-content-center p-0 border-0 bg-transparent header-action-btn"
                      type="button"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#profilePanel"
                      aria-controls="profilePanel"
                      aria-label="Open profile menu"
                    >
                      <span
                        className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-semibold"
                        style={{ width: "34px", height: "34px", backgroundColor: "#2f5d8a", fontSize: "14px" }}
                      >
                        {userInitial}
                      </span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-sm btn-primary fw-semibold d-none d-sm-inline-flex align-items-center justify-content-center subscribe-btn header-action-btn"
                    onClick={() => {
                      window.location.href = "/auth";
                    }}
                  >
                    Join Briefing
                  </button>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={onSearch} className="header-search-open-wrap">
              <input
                ref={searchInputRef}
                id="header-search-input"
                name="q"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="form-control header-search-input header-search-open-input"
                placeholder="Search stories, topics, authors..."
                aria-label="Search news"
              />
              <button className="btn btn-primary search-btn" type="submit">
                Explore
              </button>
              <button
                className="search-close-btn"
                type="button"
                aria-label="Close search"
                onClick={() => dispatch(setHeaderSearchOpen(false))}
              >
                <img src={closeIcon} alt="" className="bi-svg-icon dark-icon" aria-hidden="true" />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="section-nav-wrap border-top border-bottom classic-nav-wrap">
        <div className="container">
          <nav className="d-flex align-items-center primary-nav section-scroll-nav">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) => `text-decoration-none fw-semibold nav-item-link ${isActive ? "active" : ""}`}
              >
                {l.label}
              </NavLink>
            ))}

            <div className="dropdown ms-auto d-none d-lg-block">
              <button
                ref={moreBtnRef}
                className="btn category-mega-toggle fw-semibold px-2 py-1 rounded-0"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span className="d-inline-flex align-items-center gap-2">
                  Explore Desk
                  <span className={`more-arrow ${moreOpen ? "open" : ""}`} aria-hidden="true" />
                </span>
              </button>
              <div className="dropdown-menu dropdown-menu-end category-mega-menu">
                <div className="category-mega-grid">
                  {categories.map((cat) => (
                    <Link key={cat} className="category-mega-item dropdown-item" to={`/search?q=${encodeURIComponent(cat)}`}>
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <div className="offcanvas offcanvas-end" tabIndex="-1" id="mobileNav">
        <div className="offcanvas-header">
          <div className="fw-bold">The Global Wire</div>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body">
          <form onSubmit={onSearch} className="d-flex gap-2 mb-3">
            <input
              id="mobile-search-input"
              name="q"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-control"
              placeholder="Search stories..."
              aria-label="Search news mobile"
            />
            <button className="btn btn-primary" type="submit">
              Explore
            </button>
          </form>

          <div className="d-grid gap-2">
            {links.map((l) => (
              <a
                key={l.to}
                className="btn btn-light text-start border"
                href={l.to}
                onClick={(e) => navigateFromMobile(e, l.to)}
                onTouchEnd={(e) => navigateFromMobile(e, l.to)}
              >
                {l.label}
              </a>
            ))}
            <div className="fw-semibold mt-2 mb-1">Categories</div>
            <div className="d-grid gap-2">
              {categories.map((cat) => (
                <a
                  key={cat}
                  className="btn btn-light text-start border"
                  href={`/search?q=${encodeURIComponent(cat)}`}
                  onClick={(e) => navigateFromMobile(e, `/search?q=${encodeURIComponent(cat)}`)}
                  onTouchEnd={(e) => navigateFromMobile(e, `/search?q=${encodeURIComponent(cat)}`)}
                >
                  {cat}
                </a>
              ))}
            </div>
            {authUser ? (
              <button
                type="button"
                className="btn btn-outline-secondary fw-semibold mt-2"
                onClick={() => {
                  closeOffcanvasById("mobileNav");
                  onLogout();
                }}
              >
                Logout ({userInitial})
              </button>
            ) : (
              <a
                className="btn btn-primary fw-semibold mt-2"
                href="/auth"
                onClick={(e) => navigateFromMobile(e, "/auth")}
                onTouchEnd={(e) => navigateFromMobile(e, "/auth")}
              >
                Join Briefing
              </a>
            )}
          </div>
        </div>
      </div>

      <div
        className="offcanvas offcanvas-end profile-offcanvas"
        tabIndex="-1"
        id="profilePanel"
        aria-labelledby="profilePanelLabel"
        data-bs-backdrop="false"
        data-bs-scroll="true"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title mb-0" id="profilePanelLabel">Your Profile</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body d-flex flex-column gap-3">
          <div className="d-flex align-items-center gap-3">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-semibold"
              style={{ width: "52px", height: "52px", backgroundColor: "#2f5d8a", fontSize: "20px" }}
            >
              {userInitial}
            </span>
            <div>
              <div className="fw-semibold">{userName}</div>
              <div className="small text-secondary">{authUser?.email || "-"}</div>
            </div>
          </div>

          <ul className="list-group rounded-0">
            <li className="list-group-item">
              <button type="button" className="btn btn-link text-decoration-none text-dark d-block p-0" onClick={() => openAccountTab("saved")}>
                Saved Stories
              </button>
            </li>
            <li className="list-group-item">
              <button type="button" className="btn btn-link text-decoration-none text-dark d-block p-0" onClick={() => openAccountTab("history")}>
                Reading History
              </button>
            </li>
            <li className="list-group-item">
              <button type="button" className="btn btn-link text-decoration-none text-dark d-block p-0" onClick={() => openAccountTab("topics")}>
                Followed Topics
              </button>
            </li>
            <li className="list-group-item">
              <button type="button" className="btn btn-link text-decoration-none text-dark d-block p-0" onClick={() => openAccountTab("newsletters")}>
                Newsletter Settings
              </button>
            </li>
            <li className="list-group-item">
              <button type="button" className="btn btn-link text-decoration-none text-dark d-block p-0" onClick={() => openAccountTab("settings")}>
                Account Settings
              </button>
            </li>
          </ul>

          <button
            type="button"
            className="btn btn-outline-danger mt-auto"
            onClick={onLogout}
            data-bs-dismiss="offcanvas"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
