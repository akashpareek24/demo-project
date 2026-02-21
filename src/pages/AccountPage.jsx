import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectAuthUser, selectHistoryList, selectSavedList } from "../store/selectors";

const TAB_META = {
  saved: { title: "Saved Stories", desc: "Stories you bookmarked for later." },
  history: { title: "Reading History", desc: "Recently opened stories from this account." },
  topics: { title: "Followed Topics", desc: "Topics and beats you are tracking." },
  newsletters: { title: "Newsletter Settings", desc: "Manage briefing frequency and sections." },
  settings: { title: "Account Settings", desc: "Profile, security, and preferences." },
};

function storyPath(story = {}) {
  const fallback = String(story?.title || "story")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `/news/${story?.id || fallback || "story"}`;
}

export default function AccountPage() {
  const [searchParams] = useSearchParams();
  const authUser = useAppSelector(selectAuthUser);
  const savedStories = useAppSelector(selectSavedList).slice(0, 24);
  const historyStories = useAppSelector(selectHistoryList).slice(0, 24);

  const tab = searchParams.get("tab") || "saved";
  const meta = TAB_META[tab] || TAB_META.saved;

  const userName = useMemo(() => authUser?.displayName?.trim() || "Reader", [authUser]);

  return (
    <div className="container py-4 py-lg-5">
      <div className="row g-3">
        <aside className="col-12 col-lg-3">
          <section className="bg-white border p-3 h-100">
            <div className="small text-uppercase text-secondary mb-2">Account</div>
            <div className="fw-semibold">{userName}</div>
            <div className="small text-secondary mb-3">{authUser?.email || "Not logged in"}</div>

            <div className="list-group rounded-0">
              <Link to="/account?tab=saved" className={`list-group-item list-group-item-action ${tab === "saved" ? "active" : ""}`}>Saved Stories</Link>
              <Link to="/account?tab=history" className={`list-group-item list-group-item-action ${tab === "history" ? "active" : ""}`}>Reading History</Link>
              <Link to="/account?tab=topics" className={`list-group-item list-group-item-action ${tab === "topics" ? "active" : ""}`}>Followed Topics</Link>
              <Link to="/account?tab=newsletters" className={`list-group-item list-group-item-action ${tab === "newsletters" ? "active" : ""}`}>Newsletter Settings</Link>
              <Link to="/account?tab=settings" className={`list-group-item list-group-item-action ${tab === "settings" ? "active" : ""}`}>Account Settings</Link>
            </div>
          </section>
        </aside>

        <section className="col-12 col-lg-9">
          <div className="bg-white border p-3 p-lg-4">
            <h1 className="h4 fw-bold mb-1">{meta.title}</h1>
            <p className="text-secondary mb-3">{meta.desc}</p>

            {tab === "saved" ? (
              savedStories.length ? (
                <div className="row g-3">
                  {savedStories.map((story) => (
                    <div className="col-12 col-md-6" key={story.key || story.id || story.title}>
                      <Link to={storyPath(story)} state={{ item: story }} className="text-decoration-none">
                        <article className="border p-3 h-100 text-dark">
                          <div className="fw-semibold clamp-2 mb-1">{story.title}</div>
                          <div className="small text-secondary">{story.date || "Latest"} {story.readTime ? `| ${story.readTime}` : ""}</div>
                        </article>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-light border mb-0">No saved stories yet. Save from News Pulse star icon.</div>
              )
            ) : tab === "history" ? (
              historyStories.length ? (
                <div className="row g-3">
                  {historyStories.map((story) => (
                    <div className="col-12 col-md-6" key={story.key || story.id || story.title}>
                      <Link to={storyPath(story)} state={{ item: story }} className="text-decoration-none">
                        <article className="border p-3 h-100 text-dark">
                          <div className="fw-semibold clamp-2 mb-1">{story.title}</div>
                          <div className="small text-secondary">
                            {story.date || "Latest"} {story.readTime ? `| ${story.readTime}` : ""}
                          </div>
                        </article>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-light border mb-0">No reading history yet. Open any story to track it.</div>
              )
            ) : (
              <div className="alert alert-light border mb-0">
                This section is ready. Content can be connected next.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
