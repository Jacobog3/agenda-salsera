"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const SWIPE_THRESHOLD = 50;

export function EventImageGallery({
  coverImageUrl,
  galleryUrls,
  alt
}: {
  coverImageUrl: string;
  galleryUrls: string[];
  alt: string;
}) {
  const images = [coverImageUrl, ...galleryUrls];
  const [current, setCurrent] = useState(0);
  const touchStart = useRef<number | null>(null);

  const prev = useCallback(
    () => setCurrent((p) => (p === 0 ? images.length - 1 : p - 1)),
    [images.length]
  );

  const next = useCallback(
    () => setCurrent((p) => (p === images.length - 1 ? 0 : p + 1)),
    [images.length]
  );

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      delta < 0 ? next() : prev();
    }
    touchStart.current = null;
  };

  if (images.length === 1) {
    return (
      <div className="overflow-hidden rounded-2xl bg-neutral-100 md:rounded-3xl">
        <div className="relative aspect-[3/4] md:aspect-[4/3]">
          <Image
            src={images[0]}
            alt={alt}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl bg-neutral-100 md:rounded-3xl"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative aspect-[3/4] md:aspect-[4/3]">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${alt} (${i + 1}/${images.length})`}
            fill
            className={cn(
              "object-contain transition-opacity duration-500",
              i === current ? "opacity-100" : "opacity-0"
            )}
            priority={i === 0}
          />
        ))}

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === current
                  ? "w-5 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/80"
              )}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
