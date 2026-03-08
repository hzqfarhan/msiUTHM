/**
 * Events list page — shows upcoming events.
 */
import { getEvents } from '@/actions/events';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { PageViewTracker } from '@/components/page-view-tracker';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Program & Acara',
    description: 'Senarai program dan acara Masjid Sultan Ibrahim, UTHM',
};

export const revalidate = 300; // 5 minutes ISR

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

                    // Determine if event is past
                    const isPast = startDate < new Date();

                    return (
                        <Link key={event.id} href={`/events/${event.id}`} className="block h-full group">
                            <Card className="h-full flex flex-col hover:bg-accent/50 transition-colors border-border/50 overflow-hidden relative">
                                {/* Top Image Section */}
                                <div className="relative w-full aspect-video bg-muted/30 border-b border-border/50 overflow-hidden">
                                    {event.poster_image_url ? (
                                        <Image
                                            src={event.poster_image_url}
                                            alt={event.title}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/5 text-primary-dark dark:text-emerald-400">
                                            <span className="text-4xl font-bold leading-none mb-1">{startDate.getDate()}</span>
                                            <span className="text-xs uppercase font-medium">{startDate.toLocaleDateString('ms-MY', { month: 'short', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' })}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <CardContent className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-semibold text-[15px] leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                                        {event.title}
                                    </h3>

                                    <div className="space-y-2 text-xs text-muted-foreground mb-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                                            <span className="truncate">{dateStr}, {timeStr}</span>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                                                <span className="truncate">{event.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Spacer to push footer to bottom */}
                                    <div className="flex-1" />

                                    {/* Footer / Tags row */}
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                                        {event.tags?.length > 0 ? (
                                            <div className="flex gap-1 flex-wrap overflow-hidden">
                                                {event.tags.slice(0, 2).map((tag: string) => (
                                                    <Badge key={tag} variant="secondary" className="text-[10px] h-5 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-medium">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {event.tags.length > 2 && (
                                                    <Badge variant="secondary" className="text-[9px] h-5 px-1.5 opacity-60">
                                                        +{event.tags.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Acara MSI</span>
                                        )}

                                        <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${isPast ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                                            {isPast ? 'Berlalu' : 'Akan Datang'}
                                        </span>
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
