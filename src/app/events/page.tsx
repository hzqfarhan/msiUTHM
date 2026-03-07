/**
 * Events list page — shows upcoming events.
 */
import { getEvents } from '@/actions/events';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { PageViewTracker } from '@/components/page-view-tracker';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Program & Acara',
    description: 'Senarai program dan acara Masjid Sultan Ibrahim, UTHM',
};

export default async function EventsPage() {
    const { data: events, error } = await getEvents();

    return (
        <div className="space-y-4">
            <PageViewTracker />
            <div>
                <h1 className="text-xl font-bold">Program & Acara</h1>
                <p className="text-sm text-muted-foreground">Program dan acara MSI akan datang</p>
            </div>

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            {!events?.length && !error && (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Tiada program akan datang</p>
                        <p className="text-xs mt-1">Sila semak semula nanti.</p>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-3">
                {events?.map((event) => {
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
                        <Link key={event.id} href={`/events/${event.id}`} className="block">
                            <Card className="hover:bg-accent/50 transition-colors border-border/50">
                                <CardContent className="p-4">
                                    <div className="flex gap-3">
                                        {/* Date badge */}
                                        <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                            <span className="text-lg font-bold leading-none">{startDate.getDate()}</span>
                                            <span className="text-[9px] uppercase">{startDate.toLocaleDateString('ms-MY', { month: 'short', timeZone: 'Asia/Kuala_Lumpur' })}</span>
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-1">
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
                                            {event.tags?.length > 0 && (
                                                <div className="flex gap-1 flex-wrap">
                                                    {event.tags.map((tag: string) => (
                                                        <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1.5">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
