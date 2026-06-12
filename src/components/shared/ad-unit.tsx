"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const ADSENSE_CLIENT = "ca-pub-2884754691922948";

export function AdUnit({
  slot,
  layoutKey = "-gy+x-4m-bk+12q",
  className,
}: {
  slot: string;
  layoutKey?: string;
  className?: string;
}) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not ready
    }
  }, []);

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-2xl border border-black/[0.04] bg-card shadow-soft md:rounded-3xl">
        <div className="px-3 pt-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">
            Publicidad
          </span>
        </div>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-format="fluid"
          data-ad-layout-key={layoutKey}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
        />
      </div>
    </div>
  );
}
