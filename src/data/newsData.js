export const CATS = {
  top: "Top",
  breaking: "Breaking News",
  intel: "Intel",
  industry: "Industry",
  world: "World News",
  featured: "Featured",
};

const regions = ["US", "UK", "EU", "Asia", "Middle East", "Africa", "LatAm"];

const topicMap = {
  top: ["Diplomacy", "Economy", "Technology", "Climate", "Security"],
  breaking: ["Developing", "Alert", "Live", "Update", "Now"],
  intel: ["AI", "Cyber", "Data", "Space", "Defense"],
  industry: ["Markets", "Energy", "Startups", "Finance", "Auto"],
  world: ["Summit", "Elections", "Policy", "Aid", "Conflict"],
  featured: ["Explainer", "Interview", "Profile", "Investigation", "Long Read"],
};

const authors = [
  "Staff Desk",
  "Global Correspondent",
  "Wire Team",
  "Analyst",
  "Editor’s Pick",
  "Field Reporter",
];

const cityHints = [
  "New York",
  "London",
  "Brussels",
  "Tokyo",
  "Dubai",
  "Nairobi",
  "São Paulo",
  "Delhi",
];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function buildLongContent({ tag, region, num, category }) {
  const city = cityHints[num % cityHints.length];
  const tone =
    category === "breaking"
      ? "rapidly evolving"
      : category === "featured"
      ? "in-depth"
      : "developing";

  // 14-16 paras so detail page feels like real article
  return [
    `Dateline: ${city} — ${tag} developments in ${region} are now being closely watched as officials respond to a ${tone} situation (${num}).`,
    "Early briefings pointed to a series of decisions taken over the last few days, with multiple stakeholders signaling that more updates may follow.",
    "Sources familiar with the matter say discussions were already underway before the latest public statements, though timelines remain fluid.",
    "Analysts believe the biggest short-term impact will be seen in policy messaging and public reaction, while longer-term effects may depend on implementation.",
    "In similar past episodes, markets and institutions initially reacted with uncertainty, followed by gradual recalibration once clearer guidance arrived.",
    "Officials emphasized that coordination with partners is ongoing, and that any final outcome will depend on negotiations and verification steps.",
    "Independent observers noted that the situation may influence regional priorities, including trade, security, and cross-border cooperation.",
    "Public commentary has been mixed, with some calling for faster clarity and others urging restraint until formal details are confirmed.",
    "Experts highlight three signals to track: official timelines, commitments from key parties, and any measurable economic or operational changes.",
    "Behind the scenes, working groups are expected to continue discussions, potentially expanding the scope to address side-issues raised during talks.",
    "For institutions, the main question is how quickly the changes translate into enforceable action and what monitoring framework is used.",
    "For citizens and consumers, the immediate effect may be limited; however, second-order impacts can appear if policy shifts alter supply chains or investment sentiment.",
    "A follow-up briefing is expected soon. Until then, the focus remains on verified statements, primary documents, and on-the-ground indicators.",
    `What happens next: watch for new announcements, updated guidance, and any confirmation from international bodies related to ${tag} in ${region}.`,
  ];
}

function buildKeyPoints({ tag, region }) {
  return [
    `Why it matters: ${tag} in ${region} could influence policy and strategic alignment.`,
    "What changed: officials signaled a possible shift, with more details expected.",
    "What to watch: timelines, confirmations, and measurable impact indicators.",
  ];
}

function makeNews(category, i) {
  const region = regions[i % regions.length];
  const tag = topicMap[category][i % topicMap[category].length];
  const num = i + 1;

  const date = `2026-02-${pad2((i % 28) + 1)}`;
  const readTime = `${(i % 7) + 4} min read`;

  const summaryVariants = [
    "A quick briefing on what happened, why it matters, and what could happen next — tap for the full report.",
    "Key updates, context, and expert reaction in one place — open for the full story and timeline.",
    "New signals are emerging — read the complete report with highlights and what to watch next.",
  ];

  return {
    id: `${category}-${num}`,
    category,
    region,
    tag,
    title: `${tag}: Major shifts reported in ${region} as leaders react to new developments (${num})`,
    summary: summaryVariants[i % summaryVariants.length],
    author: authors[i % authors.length],
    date,
    readTime,

    // ✅ Extra fields for richer detail page (optional use)
    keyPoints: buildKeyPoints({ tag, region }),
    timeline: [
      { t: "Morning", d: "Early signals and initial reactions appear across official channels." },
      { t: "Midday", d: "Follow-up statements and clarifications begin to shape expectations." },
      { t: "Evening", d: "Analysts outline next steps and potential outcomes." },
    ],

    // ✅ LONG content for detail page
    content: buildLongContent({ tag, region, num, category }),
  };
}

export const newsData = [
  ...Array.from({ length: 120 }, (_, i) => makeNews("top", i)),
  ...Array.from({ length: 120 }, (_, i) => makeNews("breaking", i)),
  ...Array.from({ length: 120 }, (_, i) => makeNews("intel", i)),
  ...Array.from({ length: 120 }, (_, i) => makeNews("industry", i)),
  ...Array.from({ length: 120 }, (_, i) => makeNews("world", i)),
  ...Array.from({ length: 120 }, (_, i) => makeNews("featured", i)),
];

