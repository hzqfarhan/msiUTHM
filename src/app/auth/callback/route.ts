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
            // Sync Google profile picture into profiles table
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const googleAvatar =
                        user.user_metadata?.avatar_url ||
                        user.user_metadata?.picture ||
                        null;
                    const googleName =
                        user.user_metadata?.full_name ||
                        user.user_metadata?.name ||
                        null;

                    if (googleAvatar || googleName) {
                        const updates: Record<string, string> = {};
                        if (googleAvatar) updates.avatar_url = googleAvatar;
                        if (googleName) updates.full_name = googleName;

                        await supabase
                            .from('profiles')
                            .update(updates)
                            .eq('id', user.id);
                    }
                }
            } catch {
                // Non-critical: don't block login if profile sync fails
            }

            return NextResponse.redirect(`${origin}${redirect}`);
        }
    }

    // Auth error — redirect to login with error
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
