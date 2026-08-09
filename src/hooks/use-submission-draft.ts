"use client";

import { useEffect, useRef, useState } from "react";

const MAX_DRAFT_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function useSubmissionDraft<T>({
  storageKey,
  value,
  onRestore,
  enabled = true
}: {
  storageKey: string;
  value: T;
  onRestore: (draft: T) => void;
  enabled?: boolean;
}) {
  const [restored, setRestored] = useState(false);
  const hydrated = useRef(false);
  const restoreRef = useRef(onRestore);
  restoreRef.current = onRestore;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as { savedAt?: number; value?: T };
        if (parsed.savedAt && Date.now() - parsed.savedAt <= MAX_DRAFT_AGE_MS && parsed.value) {
          restoreRef.current(parsed.value);
          setRestored(true);
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch {
      localStorage.removeItem(storageKey);
    } finally {
      hydrated.current = true;
    }
  }, [storageKey]);

  useEffect(() => {
    if (!enabled || !hydrated.current) return;
    const timeout = window.setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify({ savedAt: Date.now(), value }));
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [enabled, storageKey, value]);

  function clearDraft() {
    localStorage.removeItem(storageKey);
    setRestored(false);
  }

  return { restored, clearDraft };
}
