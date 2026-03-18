"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Flag
} from "lucide-react";

type Report = {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name?: string | null;
  entity_slug?: string | null;
  reason: string;
  details: string | null;
  contact_email: string | null;
  status: string;
  created_at: string;
};

const REASON_LABELS: Record<string, string> = {
  wrong_date: "Fecha incorrecta",
  wrong_price: "Precio incorrecto",
  wrong_schedule: "Horario incorrecto",
  wrong_contact: "Contacto incorrecto",
  wrong_location: "Ubicación incorrecta",
  event_cancelled: "Evento cancelado",
  inactive: "Ya no está activo",
  duplicate: "Duplicado",
  other: "Otro"
};

const ENTITY_LABELS: Record<string, string> = {
  event: "Evento",
  academy: "Academia",
  teacher: "Maestro"
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      const json = await res.json();
      setReports(json.data ?? []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  async function resolveReport(id: string) {
    await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved" })
    });
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)));
  }

  async function deleteReport(id: string) {
    await fetch(`/api/admin/reports/${id}`, { method: "DELETE" });
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  const pending = reports.filter((r) => r.status === "pending");
  const resolved = reports.filter((r) => r.status === "resolved");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-gray-900 md:text-2xl">
          Reportes
        </h1>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          {pending.length} pendientes
        </span>
      </div>

      {reports.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">No hay reportes</p>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Pendientes</h2>
              {pending.map((report) => (
                <ReportCard key={report.id} report={report} onResolve={resolveReport} onDelete={deleteReport} />
              ))}
            </div>
          )}
          {resolved.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Resueltos</h2>
              {resolved.map((report) => (
                <ReportCard key={report.id} report={report} onResolve={resolveReport} onDelete={deleteReport} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ReportCard({
  report,
  onResolve,
  onDelete
}: {
  report: Report;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isPending = report.status === "pending";

  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ${isPending ? "border-amber-200" : "border-gray-200 opacity-70"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Flag className={`h-3.5 w-3.5 ${isPending ? "text-amber-500" : "text-green-500"}`} />
            <span className="text-xs font-bold uppercase text-gray-500">
              {ENTITY_LABELS[report.entity_type] ?? report.entity_type}
            </span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-gray-500">
              {report.entity_id.slice(0, 8)}
            </span>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              {REASON_LABELS[report.reason] ?? report.reason}
            </span>
          </div>

          {report.details && (
            <p className="text-sm text-gray-600">{report.details}</p>
          )}

          {report.entity_name && (
            <p className="text-sm font-medium text-gray-800">
              {report.entity_name}
              {report.entity_slug ? (
                <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-gray-500">
                  {report.entity_slug}
                </span>
              ) : null}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
            <span>{new Date(report.created_at).toLocaleDateString("es-GT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            {report.contact_email && <span>{report.contact_email}</span>}
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          {isPending && (
            <Button size="sm" variant="outline" onClick={() => onResolve(report.id)} className="h-7 gap-1 text-xs">
              <CheckCircle2 className="h-3 w-3" /> Resolver
            </Button>
          )}
          <button
            type="button"
            onClick={() => onDelete(report.id)}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
