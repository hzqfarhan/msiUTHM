/**
 * Push Notification Subscribe/Unsubscribe API route.
 * POST /api/push/subscribe — stores push subscription
 * DELETE /api/push/subscribe — removes push subscription
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const body = await request.json();
        const { subscription, sessionId } = body;

        if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
            return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
        }

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: user?.id || null,
                session_id: sessionId || null,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth_key: subscription.keys.auth,
            }, {
                onConflict: 'endpoint',
            });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { endpoint } = body;

        if (!endpoint) {
            return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
        }

        await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', endpoint);

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
