"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const CONSENT_STORAGE_KEY = "cookie_consent";
const CONSENT_EVENT = "exploraguate:cookie-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const COOKIE_CONSENT_EVENT = CONSENT_EVENT;

export function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const syncConsent = () => {
      setEnabled(localStorage.getItem(CONSENT_STORAGE_KEY) === "accepted");
    };

    syncConsent();
    window.addEventListener(CONSENT_EVENT, syncConsent);
    return () => window.removeEventListener(CONSENT_EVENT, syncConsent);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const trackDelegatedClick = (event: MouseEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-analytics-event]")
        : null;
      if (!target || typeof window.gtag !== "function") return;

      window.gtag("event", target.dataset.analyticsEvent, {
        source_event_id: target.dataset.analyticsSourceEventId,
        destination_event_id: target.dataset.analyticsDestinationEventId,
        recommendation_type: target.dataset.analyticsRecommendationType
      });
    };

    document.addEventListener("click", trackDelegatedClick);
    return () => document.removeEventListener("click", trackDelegatedClick);
  }, [enabled]);

  if (!measurementId || !enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}');`}
      </Script>
    </>
  );
}
