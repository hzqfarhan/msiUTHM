/**
 * Event detail page — glass morphism, with RSVP, Share, Calendar buttons.
 */
import { getEventById, getRsvpCount, getUserRsvp } from '@/actions/events';
import { RsvpButton } from '@/components/events/rsvp-button';
import { ShareButton } from '@/components/events/share-button';
import { QrScanTracker } from '@/components/qr-scan-tracker';
import { Calendar, MapPin, Users, ArrowLeft, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import type { Metadata } from 'next';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const { data: event } = await getEventById(id);
    return {
        title: event?.title || 'Program',
        description: event?.description?.substring(0, 160) || '',
    };
}

export default async function EventDetailPage({ params }: Props) {
    const { id } = await params;
    const { data: event, error } = await getEventById(id);

    if (error || !event) return notFound();

    const rsvpCount = await getRsvpCount(id);
    const userRsvp = await getUserRsvp(id);

    const startDate = new Date(event.start_at);
    const dateStr = startDate.toLocaleDateString('ms-MY', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Kuala_Lumpur',
    });
    const timeStr = startDate.toLocaleTimeString('ms-MY', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kuala_Lumpur',
    });

    return (
        <div className="space-y-4">
            <Suspense><QrScanTracker /></Suspense>
            <Button variant="ghost" size="sm" asChild className="h-8 text-xs -ml-2 glass-button rounded-xl border-0">
                <Link href="/events">
                    <ArrowLeft className="mr-1 h-3 w-3" /> Senarai Program
                </Link>
            </Button>

            {/* Poster */}
            {event.poster_url && (
                <div className="relative aspect-video rounded-2xl overflow-hidden glass-card">
                    <Image
                        src={event.poster_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            {/* Title & tags */}
            <div className="space-y-2">
                <h1 className="text-xl font-bold leading-tight">{event.title}</h1>
                {event.tags?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                        {event.tags.map((tag: string) => (
                            <span key={tag} className="glass-badge text-xs">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="glass-card glass-shimmer rounded-2xl p-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                        <p className="text-xs font-medium">{dateStr}</p>
                        <p className="text-[10px] text-muted-foreground">{timeStr}</p>
                    </div>
                </div>
                {event.location && (
                    <div className="glass-card glass-shimmer rounded-2xl p-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                        <p className="text-xs font-medium">{event.location}</p>
                    </div>
                )}
            </div>

            {/* Description */}
            {event.description && (
                <div className="glass-card rounded-2xl p-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                </div>
            )}

            {/* RSVP & Actions */}
            <div className="glass-card glass-shimmer rounded-2xl p-4 glow-emerald">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-emerald-500" />
                        <span className="font-medium">{rsvpCount} RSVP</span>
                        {event.max_participants && (
                            <span className="text-xs text-muted-foreground">/ {event.max_participants}</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {/* Add to Calendar */}
                        <Button variant="ghost" size="sm" asChild className="h-8 text-xs glass-button rounded-xl border-0">
                            <a href={`/api/events/${event.id}/ics`} download>
                                <CalendarPlus className="mr-1 h-3 w-3" /> Kalendar
                            </a>
                        </Button>
                        <ShareButton eventTitle={event.title} eventId={event.id} />
                        <RsvpButton eventId={event.id} hasRsvp={!!userRsvp} />
                    </div>
                </div>
            </div>
        </div>
    );
}
