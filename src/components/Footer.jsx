import { Link, NavLink, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";

export default function Footer() {
  const navigate = useNavigate();
  const pages = [
    { label: "Top", to: "/" },
    { label: "Breaking News", to: "/breaking" },
    { label: "Intel", to: "/intel" },
    { label: "Industry", to: "/industry" },
    { label: "World News", to: "/world" },
    { label: "Featured", to: "/featured" },
  ];

  const legal = [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Contact", href: "#" },
  ];

  const topics = [
    "Economy",
    "Technology",
    "Politics",
    "Culture",
    "Energy",
    "Defense",
    "Startups",
    "Climate",
  ];

  const onNewsletterSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("newsletterEmail")?.toString().trim() || "";
    if (!email) return;
    navigate(`/auth?email=${encodeURIComponent(email)}`);
  };

  return (
    <footer className="site-footer mt-5 border-top bg-white">
      <div className="container py-4 py-lg-5">
        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-2">
              <img
                src={Logo}
                alt="The Global Wire Logo"
                className="logo-img"
                onError={(e) => {
                  e.currentTarget.src = "/vite.svg";
                }}
              />
              <div className="brand-wordmark text-dark">The Global Wire</div>
            </div>
            <p className="text-secondary small mb-3">
              Independent global reporting with context, analysis, and sharp editorial curation.
            </p>
            <div className="small text-secondary d-flex flex-wrap gap-2">
              <span>World Edition</span>
              <span>|</span>
              <span>24x7 Newsroom</span>
              <span>|</span>
              <span>Reader First</span>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div className="fw-semibold mb-3 text-uppercase small">Sections</div>
            <ul className="list-unstyled d-grid gap-2 mb-0">
              {pages.map((p) => (
                <li key={p.to}>
                  <NavLink className="text-decoration-none text-secondary small footer-link" to={p.to}>
                    {p.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-6 col-md-4 col-lg-3">
            <div className="fw-semibold mb-3 text-uppercase small">Topics</div>
            <ul className="list-unstyled d-grid gap-2 mb-0">
              {topics.map((topic) => (
                <li key={topic}>
                  <Link className="text-decoration-none text-secondary small footer-link" to={`/search?q=${encodeURIComponent(topic)}`}>
                    {topic}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 col-md-4 col-lg-3">
            <div className="fw-semibold mb-3 text-uppercase small">Morning Dispatch</div>
            <p className="text-secondary small mb-2">Get the top stories and key context, once a day.</p>
            <form className="input-group" onSubmit={onNewsletterSubmit}>
              <label htmlFor="newsletterEmail" className="visually-hidden">
                Email address
              </label>
              <input
                type="email"
                id="newsletterEmail"
                name="newsletterEmail"
                className="form-control rounded-0"
                placeholder="name@email.com"
                autoComplete="email"
                required
              />
              <button type="submit" className="btn btn-primary rounded-0">
                Join
              </button>
            </form>
            <div className="small text-secondary mt-2">No spam. Unsubscribe anytime.</div>
          </div>
        </div>

        <div className="border-top mt-4 pt-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div className="small text-secondary">(c) {new Date().getFullYear()} The Global Wire by Aakash Pandiya. All rights reserved.</div>
          <div className="d-flex gap-3 small">
            {legal.map((l) => (
              <a key={l.label} href={l.href} className="text-decoration-none text-secondary footer-link">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
