"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-[72px] z-50 px-3 pb-2 md:bottom-4 md:left-auto md:right-4 md:max-w-sm md:px-0">
      <div className="relative rounded-2xl border border-black/[0.06] bg-white p-4 shadow-lg md:rounded-2xl">
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-surface-soft"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="pr-6 text-xs leading-relaxed text-muted-foreground">
          Usamos cookies de Google Analytics para mejorar la experiencia. Al aceptar, consentís
          el uso de cookies analíticas según nuestra{" "}
          <a href="/legal/privacidad" className="underline hover:text-foreground">
            política de privacidad
          </a>
          .
        </p>

        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={accept} className="h-8 text-xs">
            Aceptar
          </Button>
          <Button size="sm" variant="outline" onClick={dismiss} className="h-8 text-xs">
            Rechazar
          </Button>
        </div>
      </div>
    </div>
  );
}
