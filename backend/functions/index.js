import express from "express";
import cors from "cors";
import { onRequest } from "firebase-functions/v2/https";
import { adminDb } from "./lib/firebaseAdmin.js";
import { requireAdminUser } from "./lib/auth.js";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

function toInt(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

function mapDoc(doc) {
  return { id: doc.id, ...doc.data() };
}

function normalizeArticlePayload(raw = {}) {
  const nowTs = Date.now();
  const dateRaw = String(raw.date || "").trim();
  const publishedAtTs = Number(raw.publishedAtTs) || (dateRaw ? Date.parse(dateRaw) : nowTs) || nowTs;

  return {
    category: String(raw.category || "top").toLowerCase(),
    title: String(raw.title || "").trim(),
    summary: String(raw.summary || "").trim(),
    content: Array.isArray(raw.content) ? raw.content : String(raw.content || "").trim(),
    author: String(raw.author || "News Desk").trim(),
    region: String(raw.region || "World").trim(),
    tag: String(raw.tag || "TOP").trim(),
    readTime: String(raw.readTime || "5 min read").trim(),
    date: String(raw.date || new Date(publishedAtTs).toISOString().slice(0, 10)).trim(),
    url: String(raw.url || "").trim(),
    image: raw?.image?.src
      ? {
          src: String(raw.image.src).trim(),
          alt: String(raw.image.alt || raw.title || "news image").trim(),
        }
      : null,
    status: String(raw.status || "published").toLowerCase() === "draft" ? "draft" : "published",
    keyPoints: Array.isArray(raw.keyPoints) ? raw.keyPoints : [],
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
    publishedAtTs,
    updatedAtTs: nowTs,
  };
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "globalwire-news-api" });
});

app.get("/news", async (req, res) => {
  try {
    const category = String(req.query.category || "top").toLowerCase();
    const page = toInt(req.query.page, 1);
    const limit = toInt(req.query.limit, 12);
    const offset = (page - 1) * limit;

    let query = adminDb.collection("articles");
    query = query.where("status", "==", "published");
    if (category !== "all") query = query.where("category", "==", category);
    query = query.orderBy("publishedAtTs", "desc").offset(offset).limit(limit);

    const snap = await query.get();
    const items = snap.docs.map(mapDoc);
    res.json({ page, limit, count: items.length, items });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch news" });
  }
});

app.get("/news/:id", async (req, res) => {
  try {
    const id = String(req.params.id || "");
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }

    const doc = await adminDb.collection("articles").doc(id).get();
    if (!doc.exists) {
      res.status(404).json({ error: "News not found" });
      return;
    }

    res.json({ item: mapDoc(doc) });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch story" });
  }
});

app.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().toLowerCase();
    const category = String(req.query.category || "all").toLowerCase();
    const page = toInt(req.query.page, 1);
    const limit = toInt(req.query.limit, 25);
    const offset = (page - 1) * limit;

    if (!q) {
      res.json({ page, limit, count: 0, items: [] });
      return;
    }

    let query = adminDb.collection("articles").where("status", "==", "published");
    if (category !== "all") query = query.where("category", "==", category);
    query = query.orderBy("publishedAtTs", "desc").limit(200);

    const snap = await query.get();
    const all = snap.docs.map(mapDoc);
    const filtered = all.filter((item) => {
      const contentText = Array.isArray(item.content) ? item.content.join(" ") : String(item.content || "");
      const hay = `${item.title || ""} ${item.summary || ""} ${contentText}`.toLowerCase();
      return hay.includes(q);
    });

    const items = filtered.slice(offset, offset + limit);
    res.json({ page, limit, count: items.length, total: filtered.length, items });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Search failed" });
  }
});

app.post("/admin/news", async (req, res) => {
  try {
    await requireAdminUser(req);
    const payload = normalizeArticlePayload(req.body || {});
    if (!payload.title) {
      res.status(400).json({ error: "title is required" });
      return;
    }

    const ref = adminDb.collection("articles").doc();
    const item = {
      id: ref.id,
      ...payload,
      createdAtTs: Date.now(),
    };
    await ref.set(item);
    res.status(201).json({ item });
  } catch (err) {
    res.status(err?.statusCode || 500).json({ error: err?.message || "Create failed" });
  }
});

app.patch("/admin/news/:id", async (req, res) => {
  try {
    await requireAdminUser(req);
    const id = String(req.params.id || "");
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }

    const ref = adminDb.collection("articles").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      res.status(404).json({ error: "News not found" });
      return;
    }

    const next = normalizeArticlePayload({ ...snap.data(), ...(req.body || {}) });
    await ref.update({ ...next, id, updatedAtTs: Date.now() });
    const updated = await ref.get();
    res.json({ item: mapDoc(updated) });
  } catch (err) {
    res.status(err?.statusCode || 500).json({ error: err?.message || "Update failed" });
  }
});

app.delete("/admin/news/:id", async (req, res) => {
  try {
    await requireAdminUser(req);
    const id = String(req.params.id || "");
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }

    await adminDb.collection("articles").doc(id).delete();
    res.json({ ok: true, id });
  } catch (err) {
    res.status(err?.statusCode || 500).json({ error: err?.message || "Delete failed" });
  }
});

export const api = onRequest(
  {
    region: "asia-south1",
    invoker: "public",
  },
  app
);
