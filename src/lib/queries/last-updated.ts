import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils/env";

type TableName = "events" | "academies" | "spots";

export async function getLastUpdated(table: TableName): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(table)
    .select("created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return data.created_at as string;
}
