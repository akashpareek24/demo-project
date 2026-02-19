import axios from "axios";

const BASE_URL = import.meta.env.VITE_NEWS_BASE_URL || import.meta.env.VITE_GNEWS_BASE_URL || "https://gnews.io/api/v4";
const KEY = import.meta.env.VITE_NEWS_KEY || import.meta.env.VITE_GNEWS_KEY || "";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

const cache = new Map();
const inflight = new Map();

function clean(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function safeDate(isoDate = "") {
  const d = clean(isoDate).slice(0, 10);
  return d || "-";
}

function normalizeImg(input = "") {
  const value = clean(input);
  if (!value) return null;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("http://")) return value.replace("http://", "https://");
  return value;
}

function pickImage(article = {}) {
  return normalizeImg(article.image || article.urlToImage || article.thumbnail || "");
}

function getErrorMessage(err) {
  if (err && typeof err === "object" && "message" in err) {
    return err.message;
  }
  return String(err || "Unknown error");
}

function mapArticle(article, category, idx) {
  const title = clean(article?.title || "Untitled");
  const description = clean(article?.description || "");
  const publishedAt = clean(article?.publishedAt || "");
  const stamp = publishedAt.replace(/\D/g, "") || `${Date.now()}${idx}`;
  const image = pickImage(article);
  const source = clean(article?.source?.name || "News Desk");

  return {
    id: `${category}-${idx}-${stamp}`,
    category,
    region: source || "World",
    tag: category.toUpperCase(),
    title,
    summary: description || "Open to read details.",
    author: source || "News Desk",
    date: safeDate(publishedAt),
    readTime: "5 min read",
    image: image ? { src: image, alt: title || "news image" } : null,
    url: clean(article?.url || ""),
    content: [description, clean(article?.content || "")].filter(Boolean),
  };
}

export async function fetchGNewsTop(category = "general") {
  if (!KEY) return [];

  const normalizedCategory = clean(category || "general").toLowerCase();
  const cacheKey = `gnews:${normalizedCategory}`;

  if (cache.has(cacheKey)) return cache.get(cacheKey);
  if (inflight.has(cacheKey)) return inflight.get(cacheKey);

  const req = api
    .get("/top-headlines", {
      params: {
        apikey: KEY,
        lang: "en",
        country: "us",
        max: 25,
        category: normalizedCategory,
      },
    })
    .then((res) => {
      const articles = Array.isArray(res?.data?.articles) ? res.data.articles : [];
      const mapped = articles.map((article, idx) => mapArticle(article, normalizedCategory, idx));
      cache.set(cacheKey, mapped);
      return mapped;
    })
    .catch((err) => {
      console.error("GNews fetch error:", getErrorMessage(err));
      return [];
    })
    .finally(() => inflight.delete(cacheKey));

  inflight.set(cacheKey, req);
  return req;
}

export function clearGNewsCache() {
  cache.clear();
  inflight.clear();
}
