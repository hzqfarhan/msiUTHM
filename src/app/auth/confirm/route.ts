/**
 * Auth confirm route — handles magic link confirmation.
 */
import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const redirect = searchParams.get('redirect') || '/';

    if (token_hash && type) {
        const supabase = await createClient();
        const { error } = await supabase.auth.verifyOtp({ token_hash, type });

        if (!error) {
            return NextResponse.redirect(`${origin}${redirect}`);
        }
    }

    return NextResponse.redirect(`${origin}/auth/login?error=invalid_link`);
}
