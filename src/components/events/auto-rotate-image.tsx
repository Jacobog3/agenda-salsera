"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

const INTERVAL_MS = 4000;

export function AutoRotateImage({
  images,
  alt,
  className
}: {
  images: string[];
  alt: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(0);

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(advance, INTERVAL_MS);
    return () => clearInterval(id);
  }, [advance, images.length]);

  if (images.length <= 1) {
    return (
      <Image
        src={images[0]}
        alt={alt}
        fill
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={`${alt} (${i + 1})`}
          fill
          className={cn(
            "object-cover transition-opacity duration-700",
            i === current ? "opacity-100" : "opacity-0",
            className
          )}
        />
      ))}
      {/* Dots */}
      <div className="absolute bottom-1.5 left-1/2 z-10 flex -translate-x-1/2 gap-1">
        {images.map((_, i) => (
          <span
            key={i}
            className={cn(
              "block h-1 rounded-full transition-all duration-500",
              i === current ? "w-3 bg-white" : "w-1 bg-white/50"
            )}
          />
        ))}
      </div>
    </>
  );
}
