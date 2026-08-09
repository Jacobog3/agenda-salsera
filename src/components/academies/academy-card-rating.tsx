"use client";

import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { useLocale } from "next-intl";
import type { GooglePlaceRating } from "@/lib/google/places";

export function AcademyCardRating({ academyId }: { academyId: string }) {
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [rating, setRating] = useState<GooglePlaceRating | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const controller = new AbortController();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        void fetch(`/api/academies/${academyId}/google-rating`, {
          signal: controller.signal,
          cache: "no-store"
        })
          .then((response) => response.ok ? response.json() : null)
          .then((body: { rating?: GooglePlaceRating | null } | null) => {
            if (body?.rating) setRating(body.rating);
          })
          .catch((error: unknown) => {
            if (!(error instanceof DOMException && error.name === "AbortError")) {
              console.error("[academy-card-rating] Unable to load rating:", error);
            }
          });
      },
      { rootMargin: "160px 0px" }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, [academyId]);

  return (
    <div ref={containerRef} className="min-h-4">
      {rating ? (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground md:text-xs">
          <Star
            className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
            aria-hidden="true"
          />
          <span className="font-semibold text-foreground">
            {rating.rating.toFixed(1)}
          </span>
          <span>
            ({new Intl.NumberFormat(locale).format(rating.userRatingCount)})
          </span>
          <span aria-hidden="true">·</span>
          <span>Google Maps</span>
        </div>
      ) : null}
    </div>
  );
}
