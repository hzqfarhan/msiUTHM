/**
 * Server-only admin Supabase client using service role key.
 * NEVER import this in client-side code.
 * Use only in Server Actions / Route Handlers for admin operations.
 * NOTE: Run `supabase gen types typescript` to generate proper types.
 */
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        },
    );
}
