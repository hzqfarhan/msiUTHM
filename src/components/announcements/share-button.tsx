/**
 * Share Button for announcements — Web Share API first, WhatsApp fallback.
 */
'use client';

import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    title: string;
    body?: string | null;
}

export function AnnouncementShareButton({ title, body }: Props) {
    const handleShare = async () => {
        const text = `📢 ${title}${body ? `\n${body.substring(0, 100)}...` : ''}\n\nMSI UTHM Companion 🕌`;

        if (navigator.share) {
            try {
                await navigator.share({ title, text });
                return;
            } catch (err) {
                if ((err as Error).name === 'AbortError') return;
            }
        }

        // Fallback: WhatsApp
        const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        toast.success('Pautan dibuka di WhatsApp');
    };

    return (
        <button
            onClick={handleShare}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
            title="Kongsi"
        >
            <Share2 className="h-3 w-3" />
        </button>
    );
}
