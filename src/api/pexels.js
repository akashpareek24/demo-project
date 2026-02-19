import axios from "axios";

export async function searchPexelsImages(query, perPage = 30) {
  const key = import.meta.env.VITE_PEXELS_KEY;
  if (!key) return [];

  const res = await axios.get("https://api.pexels.com/v1/search", {
    headers: { Authorization: key },
    params: {
      query,
      per_page: perPage,
      orientation: "landscape",
      size: "large",
    },
  });

  return (res.data?.photos || []).map((p) => ({
    src: p.src?.large || p.src?.medium,
    alt: p.alt || query,
  }));
}
