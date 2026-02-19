import axios from "axios";

/* ================= CONFIG ================= */

const PROVIDER = (import.meta.env.VITE_NEWS_PROVIDER || "gnews").toLowerCase();

const GNEWS_BASE =
  import.meta.env.VITE_GNEWS_BASE_URL ||
  import.meta.env.VITE_NEWS_BASE_URL ||
  "https://gnews.io/api/v4";
   
const GNEWS_KEY =
  import.meta.env.VITE_GNEWS_KEY ||
  import.meta.env.VITE_NEWS_KEY ||
  "";

const BACKUP_NEWS_BASE =
  import.meta.env.VITE_BACKUP_NEWS_BASE_URL ||
  "https://content.guardianapis.com";

const BACKUP_NEWS_KEY =
  import.meta.env.VITE_BACKUP_NEWS_KEY ||
  "test";

const PAGE_SIZE = 12;

/* ================= CLIENTS ================= */

const gnewsClient = axios.create({
  baseURL: GNEWS_BASE,
  timeout: 10000,
});

const backupNewsClient = axios.create({
  baseURL: BACKUP_NEWS_BASE,
  timeout: 10000,
});

/* ================= CACHE ================= */

const cache = new Map();
const inflight = new Map();
let activeProvider = PROVIDER === "backup" ? "backup" : "gnews";
let gnewsBlocked = false;

export const NEWS_CATEGORIES = [
  "top",
  "breaking",
  "intel",
  "industry",
  "world",
  "featured",
];

/* ================= HELPERS ================= */

function clean(value = "") {
  return String(value)
    .replace(/\s*\[\+\d+\schars\]\s*$/i, "")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value = "") {
  return clean(value).toLowerCase();
}

function buildQueryTokens(query = "") {
  const q = normalizeText(query);
  const tokens = q.split(/[^a-z0-9]+/i).filter((t) => t.length >= 3);
  if (tokens.length) return tokens;
  return q ? [q] : [];
}

function escapeRegex(input = "") {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasWordMatch(text = "", token = "") {
  const t = normalizeText(text);
  const k = normalizeText(token);
  if (!t || !k) return false;
  const re = new RegExp(`\\b${escapeRegex(k)}\\b`, "i");
  return re.test(t);
}

function rankAndFilterByQuery(items = [], query = "") {
  const q = normalizeText(query);
  const tokens = buildQueryTokens(query);
  if (!q || !tokens.length) return Array.isArray(items) ? items : [];
  const sourceItems = Array.isArray(items) ? items : [];

  const scored = sourceItems
    .map((item) => {
      const title = normalizeText(item?.title || "");
      const summary = normalizeText(item?.summary || "");
      const meta = normalizeText(`${item?.region || ""} ${item?.tag || ""} ${item?.author || ""}`);
      const signalText = `${title} ${summary} ${meta}`.trim();

      let score = 0;
      if (title.includes(q)) score += 10;
      if (summary.includes(q)) score += 6;

      let tokenHits = 0;

      for (const token of tokens) {
        const inTitle = hasWordMatch(title, token);
        const inSummary = hasWordMatch(summary, token);
        const inMeta = hasWordMatch(meta, token);
        const inAny = inTitle || inSummary || inMeta;
        if (inAny) tokenHits += 1;
        if (inTitle) score += 4;
        if (inSummary) score += 3;
        if (inMeta) score += 1;
      }

      const directQueryMatch =
        hasWordMatch(signalText, q) ||
        title.includes(q) ||
        summary.includes(q);

      // Strictness:
      // 1 token query => token must directly appear in title/summary/meta.
      // multi-token query => at least half the tokens should match.
      const minHits = tokens.length === 1 ? 1 : Math.ceil(tokens.length / 2);
      const isRelevant = directQueryMatch || tokenHits >= minHits;

      return { item, score, isRelevant };
    })
    .filter((entry) => entry.isRelevant && entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const ranked = scored.map((entry) => entry.item);
  // Keep UX stable: if strict relevance returns empty, still show latest API stories.
  return ranked.length ? ranked : sourceItems;
}

function normalizeImg(value = "") {
  const v = clean(value);
  if (!v) return null;
  if (v.startsWith("//")) return `https:${v}`;
  if (v.startsWith("http://")) return v.replace("http://", "https://");
  return v;
}

function safeDate(value = "") {
  return clean(value).slice(0, 10) || "-";
}

function hasImage(item = {}) {
  return Boolean(item && item.image && item.image.src);
}

function dedupeNews(list = []) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const key = clean(item?.url || "") || `${clean(item?.title || "")}|${clean(item?.date || "")}`;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/* ================= SAFE ERROR HANDLING ================= */

function getErrorMessage(err) {
  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.message ||
      err.message ||
      "Request failed"
    );
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Unknown error";
}

function getErrorStatus(err) {
  if (axios.isAxiosError(err)) {
    return err.response?.status || 0;
  }
  return 0;
}

function isAuthBlockedStatus(status) {
  return status === 401 || status === 403;
}

/* ================= IMAGE PICKERS ================= */

function pickImageFromGnews(article = {}) {
  const candidates = [
    article.image,
    article.urlToImage,
    article.thumbnail,
  ];

  for (const img of candidates) {
    const cleaned = normalizeImg(img);
    if (cleaned && cleaned.startsWith("http")) return cleaned;
  }

  return null;
}

/* ================= CATEGORY MAP ================= */

const gnewsCategoryMap = {
  top: "general",
  breaking: "general",
  intel: "technology",
  industry: "business",
  world: "world",
  featured: "general",
};

const gnewsQueryMap = {
  breaking:
    "breaking OR urgent OR live OR alert OR attack OR crisis OR emergency",
  featured: "analysis OR explainer OR interview",
};

const gnewsSearchFallbackMap = {
  top: "latest headlines world politics business technology",
  breaking: "breaking urgent live update",
  intel: "technology ai cybersecurity defense intelligence",
  industry: "industry business market economy startup",
  world: "world international diplomacy geopolitics",
  featured: "feature analysis interview explainer",
};

const backupSearchMap = {
  top: ["latest headlines", "global news"],
  breaking: ["breaking", "urgent"],
  intel: ["technology ai cybersecurity"],
  industry: ["business market economy"],
  world: ["international geopolitics diplomacy"],
  featured: ["analysis interview explainer"],
};

const backupSectionMap = {
  top: "",
  breaking: "world",
  intel: "technology",
  industry: "business",
  world: "world",
  featured: "",
};

function getSearchCategory(preferredCategory = "") {
  const normalized = clean(preferredCategory).toLowerCase();
  if (!normalized || normalized === "all") return "top";
  if (NEWS_CATEGORIES.includes(normalized)) return normalized;
  return "top";
}

/* ================= MAPPER ================= */

function mapGnews(category, articles = [], page = 1) {
  return articles.map((article, idx) => {
    const title = clean(article?.title || "Untitled");
    const publishedAt = clean(article?.publishedAt || "");
    const stamp =
      publishedAt.replace(/\D/g, "") || `${Date.now()}${idx}`;

    const source = clean(article?.source?.name || "News Desk");
    const imageUrl = pickImageFromGnews(article);

    return {
      id: `${category}-${page}-${idx}-${stamp}`,
      category,
      region: source,
      tag: category.toUpperCase(),
      title,
      summary: clean(article?.description || "Open to read details."),
      author: source,
      date: safeDate(publishedAt),
      readTime: "5 min read",
      image: imageUrl ? { src: imageUrl, alt: title } : null,
      url: clean(article?.url || ""),
      content: [
        clean(article?.description || ""),
        clean(article?.content || ""),
      ].filter(Boolean),
    };
  });
}

function mapBackupNews(category, items = [], page = 1) {
  return items.map((item, idx) => {
    const title = clean(item?.title || item?.webTitle || "Untitled");
    const publishedAt = clean(item?.published_at || item?.publishedAt || item?.webPublicationDate || "");
    const stamp = publishedAt.replace(/\D/g, "") || `${Date.now()}${idx}`;
    const source = clean(item?.news_site || item?.source?.name || item?.sectionName || "News Desk");
    const imageUrl = normalizeImg(
      item?.image_url ||
      item?.image ||
      item?.urlToImage ||
      item?.fields?.thumbnail ||
      ""
    );
    const summary = clean(
      item?.summary ||
      item?.description ||
      item?.fields?.trailText ||
      "Open to read details."
    );
    const body = clean(item?.fields?.body || "");

    return {
      id: `${category}-${page}-${idx}-${stamp}`,
      category,
      region: source,
      tag: category.toUpperCase(),
      title,
      summary,
      author: clean(item?.fields?.byline || source),
      date: safeDate(publishedAt),
      readTime: "5 min read",
      image: imageUrl ? { src: imageUrl, alt: title } : null,
      url: clean(item?.url || item?.webUrl || ""),
      content: [summary, clean(item?.description || ""), body].filter(Boolean),
    };
  });
}

/* ================= FETCH FROM GNEWS ================= */

async function fetchFromGnews(category, page = 1) {
  if (gnewsBlocked) return [];
  if (!GNEWS_KEY) {
    console.warn("GNews key missing. Set VITE_GNEWS_KEY in .env");
    return [];
  }

  const normalized = clean(category).toLowerCase();
  const searchQuery = gnewsQueryMap[normalized];
  const mappedCategory =
    gnewsCategoryMap[normalized] || "general";

  const baseParams = {
    apikey: GNEWS_KEY,
    lang: "en",
    max: PAGE_SIZE,
    ...(page > 1 ? { page } : {}),
  };

  const requestPlans = searchQuery
    ? [
        { endpoint: "/search", params: { ...baseParams, q: searchQuery } },
        { endpoint: "/search", params: { apikey: GNEWS_KEY, lang: "en", max: PAGE_SIZE, q: searchQuery } },
      ]
    : [
        { endpoint: "/top-headlines", params: { ...baseParams, category: mappedCategory } },
        { endpoint: "/top-headlines", params: { apikey: GNEWS_KEY, lang: "en", max: PAGE_SIZE, category: mappedCategory } },
        {
          endpoint: "/search",
          params: {
            ...baseParams,
            q: gnewsSearchFallbackMap[normalized] || mappedCategory,
          },
        },
      ];

  let lastErr = null;
  for (const plan of requestPlans) {
    try {
      const res = await gnewsClient.get(plan.endpoint, { params: plan.params });
      const articles = Array.isArray(res?.data?.articles) ? res.data.articles : [];
      if (articles.length) return mapGnews(normalized, articles, page);
    } catch (err) {
      const status = getErrorStatus(err);
      if (isAuthBlockedStatus(status)) {
        gnewsBlocked = true;
        activeProvider = "backup";
        lastErr = err;
        break;
      }
      lastErr = err;
    }
  }

  const status = getErrorStatus(lastErr);
  if (isAuthBlockedStatus(status)) {
    console.warn("GNews auth/plan error. Check API key or endpoint access.");
    activeProvider = "backup";
    return [];
  }
  if (lastErr) throw lastErr;
  return [];
}

async function fetchFromBackupApi(category, page = 1) {
  const pageSize = PAGE_SIZE;
  const searchHints = Array.isArray(backupSearchMap[category]) && backupSearchMap[category].length
    ? backupSearchMap[category]
    : [category || "news"];
  const section = backupSectionMap[category] || "";

  for (const hint of searchHints) {
    const res = await backupNewsClient.get("/search", {
      params: {
        "api-key": BACKUP_NEWS_KEY,
        page,
        "page-size": pageSize,
        "order-by": "newest",
        "show-fields": "thumbnail,trailText,body,byline",
        ...(section ? { section } : {}),
        ...(hint ? { q: hint } : {}),
      },
    });
    const results = Array.isArray(res?.data?.response?.results) ? res.data.response.results : [];
    if (results.length) return mapBackupNews(category, results, page);
  }

  return [];
}

/* ================= MAIN FETCH ================= */

export async function fetchNewsByCategory(
  category = "top",
  options = {}
) {
  const normalized = clean(category).toLowerCase();
  const page = Number(options?.page || 1);
  const force = Boolean(options?.force);
  const providerAtStart = activeProvider;
  const cacheKey = `${providerAtStart}:${normalized}:p${page}`;

  if (!force && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Array.isArray(cached) && cached.length) return cached;
    cache.delete(cacheKey);
  }
  if (inflight.has(cacheKey)) return inflight.get(cacheKey);

  const req = (async () => {
    let data = [];

    if (providerAtStart === "gnews") {
      data = await fetchFromGnews(normalized, page);
      if (!data.length) data = await fetchFromBackupApi(normalized, page);
    }
    if (providerAtStart === "backup") {
      data = await fetchFromBackupApi(normalized, page);
    }

    data = dedupeNews(data).sort(
      (a, b) => Number(hasImage(b)) - Number(hasImage(a))
    );

    if (Array.isArray(data) && data.length) {
      cache.set(cacheKey, data);
    } else {
      cache.delete(cacheKey);
    }
    return data;
  })()
    .catch((err) => {
      const status = getErrorStatus(err);

      if (status === 429) {
        console.warn("Rate limit exceeded. Wait before retrying.");
      } else {
        console.error("News API error:", getErrorMessage(err));
      }

      return [];
    })
    .finally(() => inflight.delete(cacheKey));

  inflight.set(cacheKey, req);
  return req;
}

/* ================= SEARCH ================= */

export async function searchNews(query, preferredCategory = "") {
  const q = clean(query);
  if (!q) return [];
  const category = getSearchCategory(preferredCategory);
  const providerAtStart = activeProvider;

  const cacheKey = `${providerAtStart}:search:${category}:${q.toLowerCase()}`;
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Array.isArray(cached) && cached.length) return cached;
    cache.delete(cacheKey);
  }
  if (inflight.has(cacheKey)) return inflight.get(cacheKey);

  const req = (async () => {
    let mapped = [];

    if (providerAtStart === "gnews" && GNEWS_KEY) {
      let res;
      try {
        res = await gnewsClient.get("/search", {
          params: {
            apikey: GNEWS_KEY,
            lang: "en",
            max: 25,
            q,
          },
        });
      } catch (firstErr) {
        const status = getErrorStatus(firstErr);
        if (isAuthBlockedStatus(status)) {
          console.warn("GNews auth error. Check API key or plan.");
        } else {
          // Retry with simplified params
          res = await gnewsClient.get("/search", {
            params: {
              apikey: GNEWS_KEY,
              lang: "en",
              max: 25,
              q,
            },
          });
        }
      }
      const articles = Array.isArray(res?.data?.articles) ? res.data.articles : [];
      mapped = rankAndFilterByQuery(
        dedupeNews(mapGnews(category, articles)).sort((a, b) => Number(hasImage(b)) - Number(hasImage(a))),
        q
      );
    }

    if ((providerAtStart === "backup" || !mapped.length)) {
      const backupRes = await backupNewsClient.get("/search", {
        params: {
          "api-key": BACKUP_NEWS_KEY,
          page: 1,
          "page-size": 25,
          "order-by": "newest",
          "show-fields": "thumbnail,trailText,body,byline",
          ...(backupSectionMap[category] ? { section: backupSectionMap[category] } : {}),
          q,
        },
      });
      const backupItems = Array.isArray(backupRes?.data?.response?.results) ? backupRes.data.response.results : [];
      mapped = rankAndFilterByQuery(
        dedupeNews(mapBackupNews(category, backupItems)).sort((a, b) => Number(hasImage(b)) - Number(hasImage(a))),
        q
      );
    }

    if (Array.isArray(mapped) && mapped.length) {
      cache.set(cacheKey, mapped);
    } else {
      cache.delete(cacheKey);
    }
    return mapped;
  })()
    .catch((err) => {
      const status = getErrorStatus(err);

      if (status === 429) {
        console.warn("Rate limit exceeded. Wait before retrying.");
      } else {
        console.error("Search API error:", getErrorMessage(err));
      }

      return [];
    })
    .finally(() => inflight.delete(cacheKey));

  inflight.set(cacheKey, req);
  return req;
}

/* ================= CACHE HELPERS ================= */

export function getCachedNewsByCategory(category) {
  const normalized = clean(category || "top").toLowerCase();
  return (
    cache.get(`${activeProvider}:${normalized}:p1`) ||
    cache.get(`gnews:${normalized}:p1`) ||
    cache.get(`backup:${normalized}:p1`) ||
    null
  );
}

export function clearNewsCache() {
  cache.clear();
  inflight.clear();
  gnewsBlocked = false;
  activeProvider = PROVIDER === "backup" ? "backup" : "gnews";
}
