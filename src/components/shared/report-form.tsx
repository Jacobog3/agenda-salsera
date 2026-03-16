"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flag, CheckCircle2, Loader2, X } from "lucide-react";

const REASONS = [
  "wrong_date",
  "wrong_price",
  "wrong_location",
  "event_cancelled",
  "duplicate",
  "other"
] as const;

function ReportModal({
  entityType,
  entityId,
  onClose
}: {
  entityType: string;
  entityId: string;
  onClose: () => void;
}) {
  const t = useTranslations("report");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          reason,
          details: details || null,
          contact_email: email || null
        })
      });
      if (res.ok) {
        setStatus("success");
        setTimeout(onClose, 1800);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={(e) => e.target === backdropRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div className="w-full max-w-md animate-in slide-in-from-bottom-4 rounded-t-2xl bg-white shadow-xl sm:rounded-2xl sm:slide-in-from-bottom-2">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900">{t("reasonLabel")}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-700">{t("success")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
            <div className="grid grid-cols-2 gap-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                    reason === r
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {t(`reasons.${r}`)}
                </button>
              ))}
            </div>

            <Textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t("detailsPlaceholder")}
              className="resize-none text-sm"
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 placeholder:text-gray-400"
            />

            {status === "error" && (
              <p className="text-xs font-medium text-red-600">{t("error")}</p>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={!reason || status === "submitting"}
              className="w-full gap-1.5"
            >
              {status === "submitting" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {t("submit")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export function ReportForm({
  entityType,
  entityId
}: {
  entityType: string;
  entityId: string;
}) {
  const t = useTranslations("report");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-gray-600"
      >
        <Flag className="h-3 w-3" />
        {t("trigger")}
      </button>

      {open && (
        <ReportModal
          entityType={entityType}
          entityId={entityId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
