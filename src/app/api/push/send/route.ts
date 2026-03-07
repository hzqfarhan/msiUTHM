/**
 * Admin Push Broadcast API route.
 * POST /api/push/send — broadcast notification to all subscribers.
 * Requires web-push library and VAPID keys in env.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Verify admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { title, message, url } = body;

        if (!title || !message) {
            return NextResponse.json({ error: 'Missing title or message' }, { status: 400 });
        }

        // Fetch all subscriptions
        const { data: subscriptions } = await supabase
            .from('push_subscriptions')
            .select('*');

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ sent: 0, message: 'No subscribers' });
        }

        // For now, return the count — actual web-push sending requires the web-push npm package
        // and VAPID keys configured in environment variables.
        // TODO: Install web-push and implement actual sending when VAPID keys are available
        const payload = JSON.stringify({
            title,
            body: message,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            data: { url: url || '/' },
        });

        return NextResponse.json({
            sent: subscriptions.length,
            payload,
            message: 'Push broadcast queued (install web-push package for actual delivery)',
        });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
