import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    const observeNode = (observer, node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.classList.contains("revealed")) return;
      node.classList.add("reveal-pending");
      observer.observe(node);
    };

    const revealAll = (root = document) => {
      root.querySelectorAll(".reveal").forEach((el) => el.classList.add("revealed"));
    };

    if (!("IntersectionObserver" in window)) {
      revealAll();
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("revealed");
          entry.target.classList.remove("reveal-pending");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((node) => observeNode(observer, node));

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches(".reveal")) observeNode(observer, node);
          node.querySelectorAll?.(".reveal").forEach((child) => observeNode(observer, child));
        });
      }
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  });

  return null;
}
