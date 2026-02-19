function normalizeKey(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\w\s]|_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getStoryKey(item = {}) {
  const title = normalizeKey(item?.title || "");
  const date = normalizeKey(item?.date || "");
  const source = normalizeKey(item?.author || item?.region || "");
  if (title) return `t:${title}|${date}|${source}`;

  const url = normalizeKey(item?.url || "");
  if (url) return `u:${url}`;

  const image = normalizeKey(item?.image?.src || "");
  return image ? `i:${image}` : "";
}

function normalizeFeed(items = []) {
  const source = Array.isArray(items) ? items : [];
  const seen = new Set();
  const out = [];

  source.forEach((base) => {
    const mapped = {
      ...base,
      region: base?.region || "World",
      tag: base?.tag || (base?.category ? String(base.category).toUpperCase() : "TOP"),
      summary: base?.summary || "Open to read details.",
      readTime: base?.readTime || "5 min read",
      author: base?.author || "News Desk",
      date: base?.date || "-",
    };

    const key = getStoryKey(mapped);
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(mapped);
  });

  return out;
}

export function prepareLandingSections(items = []) {
  const feed = normalizeFeed(items);
  const lead = feed[0] || null;
  const editorPicks = feed.slice(1, 10);
  const topCards = feed.slice(1, 5);
  const insightCards = feed.slice(5, 17);
  const latestItems = feed.slice(5);

  return {
    feed,
    lead,
    editorPicks,
    topCards,
    insightCards,
    latestItems,
  };
}

