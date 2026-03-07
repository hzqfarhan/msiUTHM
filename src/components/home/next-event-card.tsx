/**
 * Next Event Card — glass morphism upcoming event.
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import type { Event } from '@/lib/types/database';

interface Props {
    event: Event;
}

export function NextEventCard({ event }: Props) {
    const startDate = new Date(event.start_at);
    const dateStr = startDate.toLocaleDateString('ms-MY', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: 'Asia/Kuala_Lumpur',
    });
    const timeStr = startDate.toLocaleTimeString('ms-MY', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kuala_Lumpur',
    });

    return (
        <div className="rounded-2xl glass-card glass-shimmer p-4 hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
                            Program Seterusnya
                        </span>
                        {event.tags?.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="glass-badge">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">{event.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {dateStr}, {timeStr}
                        </span>
                        {event.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {event.location}
                            </span>
                        )}
                    </div>
                </div>
                <Button variant="outline" size="sm" asChild className="shrink-0 h-8 text-xs glass-button rounded-xl border-[var(--glass-border)]">
                    <Link href={`/events/${event.id}`}>
                        Lihat <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
