import { Link } from "react-router-dom";

function Placeholder() {
  return <div className="bg-light border rounded-3 w-100" style={{ height: 110 }} />;
}

export default function NewsCard({ item, variant = "standard" }) {
  const imageSrc = item?.image?.src || "";
  const imageAlt = item?.image?.alt || item?.title || "news image";

  if (variant === "compact") {
    return (
      <Link to={`/news/${item.id}`} className="text-decoration-none">
        <div className="card rounded-4 border shadow-sm h-100 card-lift fade-in">
          <div className="card-body">
            <div className="d-flex gap-2 align-items-center mb-2">
              <span className="badge text-bg-light border text-dark">{item.region}</span>
              <span className="badge text-bg-primary">{item.tag}</span>
              <span className="text-secondary small ms-auto">{item.readTime}</span>
            </div>
            <div className="fw-semibold text-dark">{item.title}</div>
            <div className="text-secondary small mt-2">{item.date} • {item.author}</div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "highlight") {
    return (
      <Link to={`/news/${item.id}`} className="text-decoration-none">
        <div className="card rounded-4 border shadow-sm h-100 card-lift fade-in">
          <div className="card-body">
            <div className="d-flex gap-2 align-items-center mb-2">
              <span className="badge text-bg-primary">{item.region}</span>
              <span className="badge text-bg-light border text-dark">{item.tag}</span>
              <span className="text-secondary small ms-auto">{item.readTime}</span>
            </div>

            <div className="fw-bold fs-5 text-dark">{item.title}</div>
            <div className="text-secondary mt-2">{item.summary}</div>

            <div className="mt-3 p-2 rounded-3 bg-light border">
              <div className="small text-secondary mb-0">
                Trending note: follow-ups expected in the next briefings.
              </div>
            </div>

            <div className="d-flex justify-content-between mt-3">
              <span className="text-secondary small">{item.author}</span>
              <span className="text-secondary small">{item.date}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // standard
  return (
    <Link to={`/news/${item.id}`} className="text-decoration-none">
      <div className="card rounded-4 border shadow-sm h-100 card-lift fade-in">
        <div className="card-body">
          <div className="d-flex gap-2 align-items-center mb-2">
            <span className="badge text-bg-primary">{item.region}</span>
            <span className="badge text-bg-light border text-dark">{item.tag}</span>
            <span className="text-secondary small ms-auto">{item.readTime}</span>
          </div>

          {/* optional placeholder area (looks premium even without images) */}
          <div className="mb-3">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-100 rounded-3 border bg-light"
                style={{ height: 110, objectFit: "cover" }}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const next = e.currentTarget.nextElementSibling;
                  if (next) next.style.display = "block";
                }}
              />
            ) : null}
            <div style={{ display: imageSrc ? "none" : "block" }}>
              <Placeholder />
            </div>
          </div>

          <div className="fw-bold text-dark">{item.title}</div>
          <div className="text-secondary mt-2">{item.summary}</div>

          <div className="d-flex justify-content-between mt-3">
            <span className="text-secondary small">{item.author}</span>
            <span className="text-secondary small">{item.date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
