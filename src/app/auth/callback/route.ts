/**
 * Auth callback route handler.
 * Exchanges the OAuth code for a session and redirects to the intended page.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const redirect = searchParams.get('redirect') || '/';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(`${origin}${redirect}`);
        }
    }

    // Auth error — redirect to login with error
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
