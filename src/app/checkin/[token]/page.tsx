/**
 * Event Check-in Page — users scan QR and check in.
 * Glass morphism styling.
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, QrCode } from 'lucide-react';
import { toast } from 'sonner';

type CheckinState = 'loading' | 'ready' | 'success' | 'already' | 'expired' | 'error';

export default function CheckinPage() {
    const params = useParams();
    const token = params.token as string;

    const [state, setState] = useState<CheckinState>('loading');
    const [eventTitle, setEventTitle] = useState('');

    useEffect(() => {
        const load = async () => {
            const supabase = createClient();

            // Fetch token
            const { data: tokenData, error } = await supabase
                .from('event_checkin_tokens')
                .select('*, events(title)')
                .eq('token', token)
                .single();

            if (error || !tokenData) {
                setState('error');
                return;
            }

            // Check expiry
            if (new Date(tokenData.expires_at) < new Date()) {
                setState('expired');
                return;
            }

            setEventTitle((tokenData as any).events?.title || 'Program');
            setState('ready');
        };

        load();
    }, [token]);

    const handleCheckin = async () => {
        setState('loading');
        const supabase = createClient();

        // Get user or session
        const { data: { user } } = await supabase.auth.getUser();
        const sessionId = user ? null : `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        // Get event_id from token
        const { data: tokenData } = await supabase
            .from('event_checkin_tokens')
            .select('event_id')
            .eq('token', token)
            .single();

        if (!tokenData) {
            setState('error');
            return;
        }

        const { error } = await supabase
            .from('event_checkins')
            .insert({
                event_id: tokenData.event_id,
                user_id: user?.id || null,
                session_id: sessionId,
            });

        if (error) {
            if (error.code === '23505') {
                setState('already');
            } else {
                setState('error');
                toast.error('Gagal daftar masuk');
            }
            return;
        }

        setState('success');
        toast.success('Berjaya daftar masuk!');
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="glass-card glass-shimmer rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
                {state === 'loading' && (
                    <>
                        <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto" />
                        <p className="text-sm text-muted-foreground">Memuatkan...</p>
                    </>
                )}

                {state === 'ready' && (
                    <>
                        <div className="mx-auto rounded-full glass-button p-5 w-fit glow-emerald">
                            <QrCode className="h-10 w-10 text-emerald-500" />
                        </div>
                        <h2 className="text-lg font-bold">{eventTitle}</h2>
                        <p className="text-sm text-muted-foreground">Tekan butang untuk daftar masuk ke program ini.</p>
                        <Button onClick={handleCheckin} className="w-full glass-button rounded-xl glow-emerald text-emerald-500 font-medium">
                            <Check className="mr-2 h-4 w-4" /> Daftar Masuk
                        </Button>
                    </>
                )}

                {state === 'success' && (
                    <>
                        <div className="mx-auto rounded-full bg-emerald-500/20 p-5 w-fit glow-emerald">
                            <Check className="h-10 w-10 text-emerald-500" />
                        </div>
                        <h2 className="text-lg font-bold text-emerald-500">Berjaya!</h2>
                        <p className="text-sm text-muted-foreground">Anda telah berjaya daftar masuk ke &quot;{eventTitle}&quot;.</p>
                    </>
                )}

                {state === 'already' && (
                    <>
                        <div className="mx-auto rounded-full bg-amber-500/20 p-5 w-fit glow-gold">
                            <Check className="h-10 w-10 text-amber-500" />
                        </div>
                        <h2 className="text-lg font-bold text-amber-500">Sudah Daftar</h2>
                        <p className="text-sm text-muted-foreground">Anda sudah daftar masuk ke program ini.</p>
                    </>
                )}

                {state === 'expired' && (
                    <>
                        <div className="mx-auto rounded-full bg-red-500/20 p-5 w-fit">
                            <X className="h-10 w-10 text-red-500" />
                        </div>
                        <h2 className="text-lg font-bold text-red-500">Tamat Tempoh</h2>
                        <p className="text-sm text-muted-foreground">QR code ini telah tamat tempoh.</p>
                    </>
                )}

                {state === 'error' && (
                    <>
                        <div className="mx-auto rounded-full bg-red-500/20 p-5 w-fit">
                            <X className="h-10 w-10 text-red-500" />
                        </div>
                        <h2 className="text-lg font-bold text-red-500">Ralat</h2>
                        <p className="text-sm text-muted-foreground">QR code tidak sah atau terdapat masalah.</p>
                    </>
                )}
            </div>
        </div>
    );
}
