/**
 * Push notification helpers.
 * Groundwork for web push — stores subscriptions in DB.
 * Actual push sending is a V2 feature (via Edge Function).
 */
'use client';

import { createClient } from '@/lib/supabase/client';

/**
 * Check if push notifications are supported.
 */
export function isPushSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Request notification permission.
 */
export async function requestPermission(): Promise<NotificationPermission> {
    if (!isPushSupported()) return 'denied';
    return Notification.requestPermission();
}

/**
 * Save push subscription to Supabase.
 * Called after user grants permission and SW is registered.
 */
export async function savePushSubscription(subscription: PushSubscriptionJSON) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !subscription.endpoint) return;

    const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        keys: subscription.keys as Record<string, string>,
    }, { onConflict: 'user_id,endpoint' });

    if (error) console.error('[Push] Save subscription error:', error.message);
}
