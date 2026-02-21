import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { CATS } from "../data/newsData";
import { useNewsItem } from "../hooks/useNewsItem";
import { pushReadingHistoryState } from "../store/slices/librarySlice";
import { useAppDispatch } from "../store/hooks";

function stripHtml(input = "") {
  return String(input)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/?[^>]+(>|$)/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanLine(s = "") {
  return stripHtml(s).replace(/\s{2,}/g, " ").trim();
}

function toParagraphs(content) {
  const raw = Array.isArray(content) ? content.join("\n") : String(content || "");
  const lines = raw
    .split(/\n+/)
    .map(cleanLine)
    .filter(Boolean);

  if (!lines.length) return [];

  const out = [];
  let block = "";
  for (const line of lines) {
    const sentence = /[.!?]$/.test(line) ? line : `${line}.`;
    const next = block ? `${block} ${sentence}` : sentence;
    if (next.length >= 180) {
      out.push(next.trim().slice(0, 320));
      block = "";
    } else {
      block = next;
    }
  }
  if (block.trim()) out.push(block.trim().slice(0, 320));

  return out.slice(0, 7);
}

function buildExtraParagraphs(news, sectionName) {
  return [
    `Context: This report is part of ${sectionName} coverage and continues to evolve as official inputs come in.`,
    `Why it matters: The developments may influence decisions across ${cleanLine(news?.region || "global regions")} and related sectors.`,
    "What to track next: formal statements, implementation timelines, and measurable outcomes in coming updates.",
    "Editorial note: This briefing combines feed-based reporting with structured context for fast reading.",
  ];
}

export default function NewsDetailPage() {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const location = useLocation();
  const seedItem = location?.state?.item || null;

  const guessedCategory = String(id || "").split("-")[0] || "top";
  const category = seedItem?.category || guessedCategory;

  const { news, related, loading } = useNewsItem({
    id,
    category,
    seedItem,
    fallbackAll: [],
  });

  useEffect(() => {
    if (!news) return;
    dispatch(pushReadingHistoryState(news));
  }, [news, dispatch]);

  if (!news) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning rounded-0">{loading ? "Loading story..." : "News not found."}</div>
      </div>
    );
  }

  const sectionName = CATS[news.category] || "Section";
  const backPath = news.category === "top" ? "/" : `/${news.category}`;
  const baseParagraphs = toParagraphs(news.content);
  const paragraphs = baseParagraphs.length >= 5
    ? baseParagraphs.slice(0, 6)
    : [...baseParagraphs, ...buildExtraParagraphs(news, sectionName)].slice(0, 6);
  const keyPoints = Array.isArray(news.keyPoints) && news.keyPoints.length
    ? news.keyPoints.slice(0, 4).map(cleanLine)
    : [
        `This report belongs to ${sectionName}.`,
        "Developing updates are expected.",
        "Track official confirmations for clarity.",
      ];

  const timeline = Array.isArray(news.timeline) && news.timeline.length
    ? news.timeline.slice(0, 4)
    : [
        { t: "Initial", d: "First reports appeared." },
        { t: "Update", d: "Additional details were confirmed." },
        { t: "Now", d: "Teams are monitoring next steps." },
      ];

  return (
    <div className="container py-4 nd-page">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <span className="badge text-bg-light border rounded-0">{cleanLine(news.tag || sectionName)}</span>
          <span className="badge text-bg-primary rounded-0">{cleanLine(news.region || "World")}</span>
          <span className="small text-secondary">{news.date}</span>
          <span className="small text-secondary">|</span>
          <span className="small text-secondary">{news.readTime}</span>
        </div>
        <div className="d-flex gap-2">
          <Link to={backPath} className="btn btn-outline-secondary btn-sm fw-semibold rounded-0">Back</Link>
          {news.url ? (
            <a href={news.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm fw-semibold rounded-0">
              Open Source
            </a>
          ) : null}
        </div>
      </div>

      <div className="row g-3 align-items-start">
        <article className="col-12 col-lg-8">
          <section className="bg-white border rounded-0 shadow-sm p-3 p-lg-4 mb-3">
            <h1 className="fw-bold mb-2 nd-title">{cleanLine(news.title)}</h1>
            <p className="text-secondary mb-0">{cleanLine(news.summary)}</p>
          </section>

          {news.image?.src ? (
            <section className="bg-white border rounded-0 shadow-sm p-2 p-lg-3 mb-3">
              <img
                src={news.image.src}
                alt={news.image.alt || news.title}
                className="w-100 nd-heroImg border"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </section>
          ) : null}

          <section className="bg-white border rounded-0 shadow-sm p-3 p-lg-4">
            <div className="nd-reading">
              {(paragraphs.length ? paragraphs : [cleanLine(news.summary)]).map((p, idx) => (
                <p key={idx} className={`text-secondary mb-3 ${idx === 0 ? "nd-dropcap" : ""}`}>
                  {p}
                </p>
              ))}
            </div>
          </section>
        </article>

        <aside className="col-12 col-lg-4">
          <section className="bg-white border rounded-0 shadow-sm p-3 mb-3">
            <div className="fw-semibold mb-2">Key Points</div>
            <ul className="mb-0 ps-3">
              {keyPoints.map((point, idx) => (
                <li key={`${point}-${idx}`} className="small text-secondary mb-2">{point}</li>
              ))}
            </ul>
          </section>

          <section className="bg-white border rounded-0 shadow-sm p-3">
            <div className="fw-semibold mb-2">Timeline</div>
            <div className="d-grid gap-2">
              {timeline.map((item, idx) => (
                <div key={`${item.t}-${idx}`} className="border rounded-0 p-2 bg-light">
                  <div className="small text-uppercase text-secondary">{cleanLine(item.t)}</div>
                  <div className="small">{cleanLine(item.d)}</div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-3 bg-white border rounded-0 shadow-sm p-3 p-lg-4">
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <h2 className="h5 fw-bold mb-0">Related Stories</h2>
          <Link to={backPath} className="small text-decoration-none">More from {sectionName}</Link>
        </div>
        <div className="row g-3">
          {related.slice(0, 6).map((r) => (
            <div className="col-12 col-md-6 col-xl-4" key={r.id}>
              <Link to={`/news/${r.id}`} state={{ item: r }} className="text-decoration-none">
                <div className="border rounded-0 p-2 h-100 nd-related nd-related-card">
                  <div className="nd-related-media">
                      {r.image?.src ? (
                        <img
                          src={r.image.src}
                          alt={r.image.alt || r.title || "related story"}
                          className="w-100 border nd-related-thumb"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-100 border bg-light nd-related-thumb" />
                      )}
                  </div>
                  <div className="nd-related-body d-flex flex-column">
                      <div className="small text-uppercase text-secondary mb-1">{cleanLine(r.tag || sectionName)}</div>
                      <div className="fw-semibold clamp-3 text-dark">{cleanLine(r.title)}</div>
                      <div className="small text-secondary mt-auto">{r.date} | {r.readTime}</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
