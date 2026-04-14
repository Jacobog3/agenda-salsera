import { Tag } from "lucide-react";

const PRICE_SPLIT_PATTERN = /(Q\d+(?:[.,]\d+)?)/g;
const PRICE_TEST_PATTERN = /^Q\d/;

function PriceLine({ text }: { text: string }) {
  const segments = text.split(PRICE_SPLIT_PATTERN);

  return (
    <p className="text-sm leading-relaxed">
      {segments.map((seg, i) =>
        PRICE_TEST_PATTERN.test(seg) ? (
          <span
            key={i}
            className="mx-0.5 inline-block rounded-md bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-700"
          >
            {seg}
          </span>
        ) : (
          <span key={i} className="text-muted-foreground">
            {seg}
          </span>
        )
      )}
    </p>
  );
}

export function AcademyPricing({
  priceText,
  title
}: {
  priceText: string;
  title: string;
}) {
  const lines = priceText
    .split(/\n|·/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  return (
    <div className="rounded-2xl border border-border bg-white p-4 md:p-5">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <Tag className="h-3.5 w-3.5" />
        {title}
      </h3>
      <div className="divide-y divide-gray-100">
        {lines.map((line, i) => (
          <div key={i} className="py-2 first:pt-0 last:pb-0">
            <PriceLine text={line} />
          </div>
        ))}
      </div>
    </div>
  );
}
