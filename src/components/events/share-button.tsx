/**
 * Share Button for events — Web Share API first, WhatsApp fallback.
 * Glass morphism styling.
 */
'use client';

import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    eventTitle: string;
    eventId: string;
}

export function ShareButton({ eventTitle, eventId }: Props) {
    const handleShare = async () => {
        const url = `${window.location.origin}/events/${eventId}`;
        const text = `Jom sertai: ${eventTitle} di MSI UTHM! 🕌`;

        if (navigator.share) {
            try {
                await navigator.share({ title: eventTitle, text, url });
                return;
            } catch (err) {
                if ((err as Error).name === 'AbortError') return;
            }
        }

        // Fallback: WhatsApp
        const waUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        toast.success('Pautan dibuka di WhatsApp');
    };

    return (
        <Button variant="ghost" size="sm" onClick={handleShare} className="h-8 text-xs glass-button rounded-xl border-0">
            <Share2 className="mr-1 h-3 w-3" /> Kongsi
        </Button>
    );
}
