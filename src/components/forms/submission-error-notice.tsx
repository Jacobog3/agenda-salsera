"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { reportSubmissionIncident } from "@/lib/submissions/client";
import type { SubmissionType } from "@/lib/submissions/analysis";

export function SubmissionErrorNotice({
  message,
  submissionType,
  step,
  route
}: {
  message: string;
  submissionType: SubmissionType;
  step: "upload" | "ai_basic" | "submit" | "recovery";
  route: string;
}) {
  const t = useTranslations("forms");
  const [reporting, setReporting] = useState(false);
  const [incidentCode, setIncidentCode] = useState("");
  const [reportError, setReportError] = useState("");

  async function report() {
    setReporting(true);
    setReportError("");
    try {
      setIncidentCode(await reportSubmissionIncident({
        submissionType,
        step,
        message,
        route
      }));
    } catch (error) {
      setReportError(error instanceof Error ? error.message : t("incidentReportError"));
    } finally {
      setReporting(false);
    }
  }

  return (
    <div className="space-y-2 rounded-xl bg-red-50 p-3 md:p-4">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500 md:h-5 md:w-5" />
        <p className="text-xs font-medium text-red-700 md:text-sm">{message}</p>
      </div>
      {incidentCode ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {t("incidentReported", { code: incidentCode })}
        </p>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-red-700 hover:bg-red-100"
          disabled={reporting}
          onClick={report}
        >
          {reporting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
          {t("reportProblem")}
        </Button>
      )}
      {reportError ? <p className="text-xs text-red-700">{reportError}</p> : null}
    </div>
  );
}
