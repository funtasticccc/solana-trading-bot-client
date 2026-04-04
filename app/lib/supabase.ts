import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_client) {
      const url = process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "";
      const key = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ?? "";
      if (!url || !key) throw new Error("[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
      _client = createClient(url, key);
    }
    return (_client as unknown as Record<string | symbol, unknown>)[prop];
  },
});
