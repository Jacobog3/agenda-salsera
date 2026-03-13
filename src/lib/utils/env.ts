export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  adminPassword: process.env.ADMIN_PASSWORD,
  geminiApiKey: process.env.GEMINI_API_KEY
};

export const isSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseAnonKey
);
