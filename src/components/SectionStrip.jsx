import { CompactStory, RowTriple, FeatureSplit, SectionHeader } from "./NewsBlocks";

export default function SectionStrip({ title, subtitle, to, items }) {
  const a = items[0], b = items[1], c = items[2], d = items[3];

  return (
    <section className="bg-white border rounded-4 shadow-sm p-3 p-lg-4">
      <SectionHeader title={title} subtitle={subtitle} to={to} />

      <div className="mt-3 d-grid gap-3">
        <RowTriple a={a} b={b} c={c} />
        {/* different pattern inside strip so it doesn't feel repetitive */}
        <FeatureSplit item={d} />
      </div>
    </section>
  );
}
