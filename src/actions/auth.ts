/**
 * Server actions for authentication.
 */
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signInWithMagicLink(formData: FormData) {
    const email = formData.get('email') as string;
    const redirectTo = (formData.get('redirect') as string) || '/';

    if (!email) {
        return { error: 'Sila masukkan email anda' };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?redirect=${redirectTo}`,
        },
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true, message: 'Link log masuk telah dihantar ke email anda!' };
}

export async function signInWithGoogle(redirectTo: string = '/') {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?redirect=${redirectTo}`,
        },
    });

    if (error || !data.url) {
        return { error: error?.message || 'Ralat semasa log masuk Google' };
    }

    redirect(data.url);
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
}
