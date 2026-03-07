/**
 * Push Notification Opt-in Component — allows users to subscribe.
 * Glass morphism styling.
 */
'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function PushOptIn() {
    const [supported, setSupported] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            setSupported(true);
            // Check existing subscription
            navigator.serviceWorker.ready.then(async (reg) => {
                const sub = await reg.pushManager.getSubscription();
                setSubscribed(!!sub);
            });
        }
    }, []);

    const subscribe = async () => {
        setLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;

            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidKey) {
                toast.error('VAPID key tidak dikonfigurasi');
                setLoading(false);
                return;
            }

            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidKey,
            });

            const res = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                    sessionId: `session_${Date.now()}`,
                }),
            });

            if (res.ok) {
                setSubscribed(true);
                toast.success('Notifikasi diaktifkan!');
            } else {
                toast.error('Gagal mendaftar notifikasi');
            }
        } catch {
            toast.error('Gagal mendaftar notifikasi');
        }
        setLoading(false);
    };

    const unsubscribe = async () => {
        setLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const subscription = await reg.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();
                await fetch('/api/push/subscribe', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                });
            }

            setSubscribed(false);
            toast.success('Notifikasi dimatikan');
        } catch {
            toast.error('Gagal mematikan notifikasi');
        }
        setLoading(false);
    };

    if (!supported) return null;

    return (
        <div className="glass-card glass-shimmer rounded-2xl p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2 ${subscribed ? 'text-emerald-500 bg-emerald-500/10' : 'text-muted-foreground bg-muted'}`}>
                        {subscribed ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </div>
                    <div>
                        <p className="text-sm font-medium">Notifikasi Push</p>
                        <p className="text-[10px] text-muted-foreground">
                            {subscribed ? 'Anda akan menerima pemberitahuan' : 'Aktifkan untuk terima berita terkini'}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={subscribed ? unsubscribe : subscribe}
                    disabled={loading}
                    className="glass-button rounded-xl text-xs"
                >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : subscribed ? 'Matikan' : 'Aktifkan'}
                </Button>
            </div>
        </div>
    );
}
