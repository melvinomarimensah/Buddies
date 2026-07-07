import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses Storage RLS. Only import this from server actions
// or route handlers ("use server" / server-only modules); never from client code.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
