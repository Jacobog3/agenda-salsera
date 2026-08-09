"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

const CONSENT_STORAGE_KEY = "cookie_consent";
const CONSENT_EVENT = "somossalsa:cookie-consent";
const ANALYTICS_READY_EVENT = "somossalsa:google-analytics-ready";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const COOKIE_CONSENT_EVENT = CONSENT_EVENT;

export function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const initializedPathTracking = useRef(false);
  const lastTrackedPath = useRef(pathname);

  useEffect(() => {
    const syncConsent = () => {
      setEnabled(localStorage.getItem(CONSENT_STORAGE_KEY) === "accepted");
    };

    syncConsent();
    window.addEventListener(CONSENT_EVENT, syncConsent);
    return () => window.removeEventListener(CONSENT_EVENT, syncConsent);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setReady(false);
      initializedPathTracking.current = false;
      return;
    }

    const syncReady = () => setReady(typeof window.gtag === "function");

    syncReady();
    window.addEventListener(ANALYTICS_READY_EVENT, syncReady);
    return () => window.removeEventListener(ANALYTICS_READY_EVENT, syncReady);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !ready || typeof window.gtag !== "function") return;

    // The initial gtag config call already sends the first page_view.
    if (!initializedPathTracking.current) {
      initializedPathTracking.current = true;
      lastTrackedPath.current = pathname;
      return;
    }

    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    const timeoutId = window.setTimeout(() => {
      window.gtag?.("event", "page_view", {
        page_location: window.location.href,
        page_path: pathname,
        page_title: document.title
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [enabled, pathname, ready]);

  useEffect(() => {
    if (!enabled || !ready) return;

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
  }, [enabled, ready]);

  if (!measurementId || !enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}');window.dispatchEvent(new Event('${ANALYTICS_READY_EVENT}'));`}
      </Script>
    </>
  );
}
