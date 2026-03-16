"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Flag, CheckCircle2, Loader2, ChevronDown } from "lucide-react";

const REASONS = [
  "wrong_date",
  "wrong_price",
  "wrong_location",
  "event_cancelled",
  "duplicate",
  "other"
] as const;

export function ReportForm({
  entityType,
  entityId
}: {
  entityType: string;
  entityId: string;
}) {
  const t = useTranslations("report");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

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
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
        <p className="text-xs font-medium text-green-700">{t("success")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Flag className="h-3.5 w-3.5" />
        {t("trigger")}
        <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="space-y-3 border-t border-border px-4 pb-4 pt-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("reasonLabel")}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="flex h-9 w-full rounded-lg border border-border bg-surface-soft px-3 text-sm text-foreground"
            >
              <option value="">{t("selectReason")}</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>{t(`reasons.${r}`)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("detailsLabel")}
            </label>
            <Textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t("detailsPlaceholder")}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("emailLabel")}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="h-9 text-sm"
            />
          </div>

          {status === "error" && (
            <p className="text-xs font-medium text-destructive">{t("error")}</p>
          )}

          <Button type="submit" size="sm" disabled={!reason || status === "submitting"} className="gap-1.5">
            {status === "submitting" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Flag className="h-3.5 w-3.5" />}
            {t("submit")}
          </Button>
        </form>
      )}
    </div>
  );
}
