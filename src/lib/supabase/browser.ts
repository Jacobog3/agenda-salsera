import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/utils/env";

export function createSupabaseBrowserClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
