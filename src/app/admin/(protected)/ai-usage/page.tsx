import { Activity, Coins, Hash, MessageSquareText } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type UsageRow = {
  created_at: string;
  model: string;
  operation: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number | string | null;
};

const OPERATION_LABELS: Record<string, string> = {
  "parse-flyer": "Autocompletar formulario público",
  "admin-ai-update": "Analizar contenido en Admin",
  "submission-analysis": "Revisar relaciones",
  "auto-translate": "Traducción automática"
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-GT").format(value);
}

function formatCost(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 6
  }).format(value);
}

export default async function AdminAiUsagePage() {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 30);

  let rows: UsageRow[] = [];
  let errorMessage = "";

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("ai_usage_events")
      .select("created_at,model,operation,input_tokens,output_tokens,total_tokens,estimated_cost_usd")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(5_000);

    if (error) throw error;
    rows = (data ?? []) as UsageRow[];
  } catch (error) {
    errorMessage = error instanceof Error
      ? error.message
      : "No se pudo consultar el consumo de IA.";
  }

  const totals = rows.reduce(
    (sum, row) => ({
      requests: sum.requests + 1,
      inputTokens: sum.inputTokens + Number(row.input_tokens || 0),
      outputTokens: sum.outputTokens + Number(row.output_tokens || 0),
      totalTokens: sum.totalTokens + Number(row.total_tokens || 0),
      cost: sum.cost + Number(row.estimated_cost_usd || 0)
    }),
    { requests: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0 }
  );

  const grouped = [...rows.reduce((map, row) => {
    const current = map.get(row.operation) ?? {
      operation: row.operation,
      requests: 0,
      inputTokens: 0,
      outputTokens: 0,
      cost: 0
    };
    current.requests += 1;
    current.inputTokens += Number(row.input_tokens || 0);
    current.outputTokens += Number(row.output_tokens || 0);
    current.cost += Number(row.estimated_cost_usd || 0);
    map.set(row.operation, current);
    return map;
  }, new Map<string, {
    operation: string;
    requests: number;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  }>()).values()].sort((a, b) => b.cost - a.cost);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
          Observabilidad
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-gray-950">
          Consumo de IA
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Tokens y costo estimado de Gemini durante los últimos 30 días. No se guardan prompts,
          respuestas, archivos ni datos personales.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Activity} label="Respuestas" value={formatNumber(totals.requests)} />
        <MetricCard icon={MessageSquareText} label="Tokens de entrada" value={formatNumber(totals.inputTokens)} />
        <MetricCard icon={Hash} label="Tokens de salida" value={formatNumber(totals.outputTokens)} />
        <MetricCard icon={Coins} label="Costo estimado" value={formatCost(totals.cost)} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3 md:px-5">
          <h2 className="font-semibold text-gray-950">Por operación</h2>
        </div>

        {grouped.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-500">
            Todavía no hay consumo registrado en este período.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {grouped.map((item) => (
              <div
                key={item.operation}
                className="grid gap-2 px-4 py-4 text-sm md:grid-cols-[minmax(0,1fr)_110px_140px_110px] md:items-center md:px-5"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {OPERATION_LABELS[item.operation] ?? item.operation}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">{item.operation}</p>
                </div>
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">{formatNumber(item.requests)}</span> respuestas
                </p>
                <p className="text-gray-600">
                  {formatNumber(item.inputTokens)} entrada · {formatNumber(item.outputTokens)} salida
                </p>
                <p className="font-semibold text-gray-900 md:text-right">
                  {formatCost(item.cost)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        El costo se calcula con la tarifa estándar configurada para el modelo. La factura de
        Google continúa siendo la fuente definitiva y puede reflejar datos con retraso.
      </p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-gray-500">
        <Icon className="h-4 w-4 text-brand-600" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums text-gray-950">{value}</p>
    </div>
  );
}
