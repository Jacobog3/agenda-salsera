export type AdminClientErrorLog = {
  client_id: string;
  created_at: string;
  route: string;
  message: string;
  stack: string | null;
  digest: string | null;
  user_agent?: string | null;
  release_sha?: string | null;
  source?: "local" | "server";
};

export const ADMIN_ERROR_STORAGE_KEY = "somossalsa.admin.client-errors";
const MAX_LOCAL_ERRORS = 20;

export function readLocalAdminErrors(): AdminClientErrorLog[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(ADMIN_ERROR_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalAdminError(entry: AdminClientErrorLog) {
  try {
    const existing = readLocalAdminErrors();
    const next = [entry, ...existing.filter((item) => item.client_id !== entry.client_id)]
      .slice(0, MAX_LOCAL_ERRORS);
    localStorage.setItem(ADMIN_ERROR_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // The server copy can still be sent when local storage is unavailable.
  }
}

export function formatAdminErrorDiagnostic(entry: AdminClientErrorLog) {
  return [
    `Mensaje: ${entry.message || "Sin mensaje"}`,
    `Referencia: ${entry.digest || "Sin referencia"}`,
    `Ruta: ${entry.route || "Sin ruta"}`,
    `Fecha: ${entry.created_at}`,
    `Versión: ${entry.release_sha || "Sin versión"}`,
    `Stack: ${entry.stack || "Sin stack disponible"}`
  ].join("\n");
}
