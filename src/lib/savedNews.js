export const SAVED_KEY = "newsPulseSaved";
export const SAVED_EVENT = "newsPulseSavedUpdated";
export const HISTORY_KEY = "newsPulseHistory";
export const HISTORY_EVENT = "newsPulseHistoryUpdated";

export function getStoryKey(item = {}) {
  return item?.id || item?.url || item?.title || "";
}

function normalizeEntry(key, value) {
  if (!key) return null;

  if (value === true) {
    return { key, id: key, title: "Saved Story", savedAt: 0 };
  }

  if (!value || typeof value !== "object") return null;

  return {
    key,
    id: value.id || key,
    title: value.title || "Saved Story",
    date: value.date || "",
    readTime: value.readTime || "",
    category: value.category || "top",
    image: value.image?.src ? { src: value.image.src, alt: value.image.alt || value.title || "news image" } : null,
    savedAt: Number(value.savedAt) || 0,
  };
}

export function readSavedMap() {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object") return {};

    const normalized = {};
    Object.entries(parsed).forEach(([key, value]) => {
      const item = normalizeEntry(key, value);
      if (item) normalized[key] = item;
    });
    return normalized;
  } catch {
    return {};
  }
}

export function writeSavedMap(next = {}) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(SAVED_EVENT));
  } catch {
    // ignore storage errors
  }
}

export function toggleSavedStory(item = {}) {
  const key = getStoryKey(item);
  if (!key) return readSavedMap();

  const current = readSavedMap();
  const next = { ...current };

  if (next[key]) {
    delete next[key];
  } else {
    next[key] = {
      key,
      id: item.id || key,
      title: item.title || "Saved Story",
      date: item.date || "",
      readTime: item.readTime || "",
      category: item.category || "top",
      image: item.image?.src ? { src: item.image.src, alt: item.image.alt || item.title || "news image" } : null,
      savedAt: Date.now(),
    };
  }

  writeSavedMap(next);
  return next;
}

export function getSavedStoriesList(limit = 12) {
  const entries = Object.values(readSavedMap());
  const sorted = entries.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
  return sorted.slice(0, limit);
}

function normalizeHistoryEntry(value) {
  if (!value || typeof value !== "object") return null;

  const key = getStoryKey(value);
  if (!key) return null;

  return {
    key,
    id: value.id || key,
    title: value.title || "Story",
    date: value.date || "",
    readTime: value.readTime || "",
    category: value.category || "top",
    image: value.image?.src ? { src: value.image.src, alt: value.image.alt || value.title || "news image" } : null,
    visitedAt: Number(value.visitedAt) || 0,
  };
}

export function readHistoryList() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeHistoryEntry).filter(Boolean);
  } catch {
    return [];
  }
}

export function writeHistoryList(list = []) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(HISTORY_EVENT));
  } catch {
    // ignore storage errors
  }
}

export function pushReadingHistory(item = {}) {
  const entry = normalizeHistoryEntry({ ...item, visitedAt: Date.now() });
  if (!entry) return readHistoryList();

  const existing = readHistoryList().filter((h) => h.key !== entry.key);
  const next = [entry, ...existing].slice(0, 60);
  writeHistoryList(next);
  return next;
}

export function getReadingHistory(limit = 24) {
  return readHistoryList()
    .sort((a, b) => (b.visitedAt || 0) - (a.visitedAt || 0))
    .slice(0, limit);
}
