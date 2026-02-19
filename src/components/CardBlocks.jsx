import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

function ImgSlot({ item, h = 160 }) {
  const [step, setStep] = useState(0);
  const src = item?.image?.src || "";
  const alt = item?.image?.alt || item?.title || "news image";

  const candidates = useMemo(() => {
    const list = [];
    if (src) list.push(src);
    return list;
  }, [src]);

  const activeSrc = candidates[step] || "";
  if (!activeSrc) {
    return <div className="bg-light border w-100 img-slot-empty" style={{ height: h }} />;
  }

  return (
    <div className="bg-light border w-100 overflow-hidden img-slot" style={{ height: h }}>
      <img
        src={activeSrc}
        alt={alt}
        className="w-100 h-100 img-slot-img"
        style={{ objectFit: "cover", display: "block" }}
        onError={() => {
          if (step < candidates.length - 1) setStep((s) => s + 1);
          else setStep(999);
        }}
      />

      {step === 999 && (
        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-secondary small">Image unavailable</div>
      )}
    </div>
  );
}

export function SmallTextCard({ item }) {
  return (
    <Link to={`/news/${item.id}`} state={{ item }} className="text-decoration-none">
      <article className="card h-100 card-lift reveal feed-card text-only-card story-slate-card">
        <div className="card-body">
          <div className="d-flex gap-2 align-items-center mb-2 small story-meta-row">
            <span className="card-kicker story-tag">{item.tag}</span>
            <span className="text-secondary story-date ms-auto">{item.date}</span>
          </div>

          <h3 className="fw-bold clamp-2 card-headline-sm story-title">{item.title}</h3>
          <div className="text-secondary small mt-2 clamp-2 story-summary">{item.summary}</div>

          <div className="mt-auto pt-3 d-flex align-items-center justify-content-between story-footer">
            <span className="text-secondary small">
              {item.region} | {item.readTime}
            </span>
            <span className="story-cta">
              Read
              <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path d="M7 4l6 6-6 6" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function SmallImageCard({ item }) {
  return (
    <Link to={`/news/${item.id}`} state={{ item }} className="text-decoration-none">
      <article className="card h-100 card-lift overflow-hidden reveal feed-card feed-card-image">
        <div className="feed-media">
          <ImgSlot item={item} h={150} />
        </div>

        <div className="card-body d-flex flex-column feed-overlay pt-2">
          <div className="d-flex gap-2 align-items-center mb-2 small">
            <span className="card-kicker">{item.tag}</span>
            <span className="text-secondary">{item.date}</span>
          </div>

          <h3 className="fw-bold clamp-2 card-headline-sm">{item.title}</h3>
          <div className="text-secondary small mt-2 clamp-2">{item.summary}</div>
          <div className="text-secondary small mt-auto pt-2 card-meta-line">
            {item.region} | {item.readTime}
          </div>
        </div>
      </article>
    </Link>
  );
}

export function BigCard({ item }) {
  return (
    <Link to={`/news/${item.id}`} state={{ item }} className="text-decoration-none">
      <article className="card card-lift reveal feed-card lead-story-card">
        <div className="card-body">
          <div className="d-flex gap-2 align-items-center mb-2 small">
            <span className="card-kicker">{item.tag}</span>
            <span className="text-secondary">{item.date}</span>
          </div>

          <h2 className="fw-bold mt-1 lead-headline">{item.title}</h2>
          <div className="text-secondary mt-2 mb-2 clamp-2">{item.summary}</div>
          <ImgSlot item={item} h={250} />

          <div className="d-flex justify-content-between mt-3 pt-2 border-top">
            <span className="text-secondary small clamp-1">{item.author}</span>
            <span className="text-secondary small">{item.readTime}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function FullWidthHeadline({ item }) {
  return (
    <Link to={`/news/${item.id}`} state={{ item }} className="text-decoration-none">
      <div className="card shadow-sm card-lift reveal feed-card">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
            <span className="badge text-bg-primary">{item.region}</span>
            <span className="badge text-bg-light border text-dark">{item.tag}</span>
            <span className="text-secondary small ms-auto">
              {item.date} | {item.readTime}
            </span>
          </div>

          <div className="fw-bold display-6 clamp-2 full-headline-title">
            {item.title}
          </div>
          <div className="text-secondary mt-2 clamp-3">{item.summary}</div>
        </div>
      </div>
    </Link>
  );
}

export function SplitCard({ item }) {
  return (
    <Link to={`/news/${item.id}`} state={{ item }} className="text-decoration-none">
      <div className="card shadow-sm card-lift overflow-hidden reveal feed-card">
        <div className="row g-0">
          <div className="col-md-5 p-3">
            <ImgSlot item={item} h={140} />
          </div>

          <div className="col-md-7">
            <div className="card-body">
              <div className="d-flex gap-2 align-items-center mb-2">
                <span className="badge text-bg-light border text-dark">{item.region}</span>
                <span className="badge text-bg-primary">{item.tag}</span>
                <span className="text-secondary small ms-auto">{item.readTime}</span>
              </div>

              <div className="fw-bold fs-5 clamp-2">{item.title}</div>
              <div className="text-secondary mt-2 clamp-2">{item.summary}</div>

              <div className="text-secondary small mt-auto pt-3 clamp-1">
                {item.author} | {item.date}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
