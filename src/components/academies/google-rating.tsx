import { ExternalLink, Star } from "lucide-react";
import type { GooglePlaceRating as GooglePlaceRatingData } from "@/lib/google/places";

export function GoogleRating({
  rating,
  reviewCountLabel,
  linkLabel
}: {
  rating: GooglePlaceRatingData;
  reviewCountLabel: string;
  linkLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 md:p-5">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden="true" />
        <span className="text-lg font-bold text-foreground">
          {rating.rating.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">{reviewCountLabel}</span>
      </div>
      <a
        href={rating.googleMapsUri}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 hover:underline"
      >
        {linkLabel}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
      <p className="mt-2 text-[10px] font-medium text-muted-foreground">
        Google Maps
      </p>
    </div>
  );
}
