/**
 * RSVP Button — client component for RSVP/cancel actions.
 */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { rsvpToEvent, cancelRsvp } from '@/actions/events';
import { trackRsvp } from '@/services/analytics';
import { Check, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Props {
    eventId: string;
    hasRsvp: boolean;
}

export function RsvpButton({ eventId, hasRsvp }: Props) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleClick = async () => {
        setLoading(true);
        try {
            if (hasRsvp) {
                const result = await cancelRsvp(eventId);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success('RSVP dibatalkan');
                    trackRsvp(eventId, 'cancelled');
                }
            } else {
                const result = await rsvpToEvent(eventId);
                if (result.error) {
                    if (result.error.includes('log masuk')) {
                        toast.error('Sila log masuk untuk RSVP');
                        router.push(`/auth/login?redirect=/events/${eventId}`);
                        return;
                    }
                    toast.error(result.error);
                } else {
                    toast.success('RSVP berjaya! ✅');
                    trackRsvp(eventId, 'created');
                }
            }
        } finally {
            setLoading(false);
            router.refresh();
        }
    };

    return (
        <Button
            onClick={handleClick}
            disabled={loading}
            size="sm"
            variant={hasRsvp ? 'outline' : 'default'}
            className={hasRsvp ? 'h-8 text-xs' : 'h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white'}
        >
            {hasRsvp ? (
                <>
                    <Check className="mr-1 h-3 w-3" /> Hadir
                </>
            ) : (
                <>
                    <UserPlus className="mr-1 h-3 w-3" /> RSVP
                </>
            )}
        </Button>
    );
}
