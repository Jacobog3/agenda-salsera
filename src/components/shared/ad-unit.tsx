"use client";

import { useEffect, useRef, useState } from "react";

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
  const insRef = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not ready
    }

    const el = insRef.current;
    if (!el) return;

    const hide = () => {
      const style = el.getAttribute("style") ?? "";
      if (style.includes("display: none") || style.includes("display:none") || el.offsetHeight === 0) {
        setHidden(true);
      }
    };

    const observer = new MutationObserver(hide);
    observer.observe(el, { attributes: true, attributeFilter: ["style"] });

    // Fallback: if no ad filled after 2s, hide the empty block
    const timer = setTimeout(hide, 2000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  if (hidden) return null;

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-2xl border border-black/[0.04] bg-card shadow-soft md:rounded-3xl">
        <div className="px-3 pt-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">
            Publicidad
          </span>
        </div>
        <ins
          ref={insRef as React.RefObject<HTMLModElement>}
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
