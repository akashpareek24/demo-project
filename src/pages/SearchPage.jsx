import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import FeedLayout from "../components/FeedLayout";
import { CATS } from "../data/newsData";
import { useNewsSearch } from "../hooks/useNewsSearch";
import { setSearchCategory } from "../store/slices/uiSlice";

function prettyCat(cat) {
  if (cat === "all") return "All";
  return CATS[cat] || cat;
}

export default function SearchPage() {
  const dispatch = useDispatch();
  const category = useSelector((s) => s.ui.searchCategory);
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();

  const { items, loading, err, availableCategories } = useNewsSearch(query, category);

  const categoryList = useMemo(() => {
    if (!availableCategories.length) return ["all"];
    return availableCategories;
  }, [availableCategories]);

  return (
    <div className="container py-4 search-page-shell">
      <div className="border-bottom pb-2 mb-3 search-head">
        <div className="h4 fw-bold mb-1">Search</div>
        <div className="small text-secondary">
          {query ? `Showing stories for "${query}"` : "Use the header search to find stories."}
        </div>
      </div>

      <div className="search-filter-row mb-3 search-filter-wrap">
        {categoryList.map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm rounded-0 ${category === cat ? "btn-primary" : "btn-outline-secondary"}`}
            type="button"
            onClick={() => dispatch(setSearchCategory(cat))}
          >
            {prettyCat(cat)}
          </button>
        ))}
        <span className="small text-secondary ms-auto">{loading ? "Searching..." : `${items.length} stories`}</span>
      </div>

      {err ? <div className="alert alert-danger py-2 mb-3">{err}</div> : null}

      <FeedLayout items={items} showLead={false} paginate={false} emptyText="Try different keywords or section filters." />
    </div>
  );
}
