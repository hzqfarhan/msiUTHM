/**
 * Universal Share Button — Web Share API first, fallback to WhatsApp.
 * Glass morphism styling.
 */
'use client';

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
    title: string;
    text: string;
    url: string;
    className?: string;
    variant?: 'icon' | 'full';
}

export function ShareButton({ title, text, url, className = '', variant = 'full' }: Props) {
    const handleShare = async () => {
        const fullUrl = typeof window !== 'undefined'
            ? `${window.location.origin}${url}`
            : url;

        const shareText = `${title}\n${text}\n${fullUrl}`;

        // Try Web Share API first
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title, text, url: fullUrl });
                return;
            } catch (err) {
                // User cancelled — do nothing
                if ((err as Error).name === 'AbortError') return;
            }
        }

        // Fallback: WhatsApp
        const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        toast.success('Pautan dibuka di WhatsApp');
    };

    if (variant === 'icon') {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className={`glass-button rounded-xl border-0 h-9 w-9 ${className}`}
                title="Kongsi"
            >
                <Share2 className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className={`glass-button rounded-xl text-xs ${className}`}
        >
            <Share2 className="mr-1.5 h-3.5 w-3.5" /> Kongsi
        </Button>
    );
}
