/**
 * Activities Carousel — scrollable horizontal list of upcoming events with poster images.
 * Replaces the old "Akses Pantas" quick-actions grid.
 */
'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityEvent {
    id: string;
    title: string;
    description: string | null;
    start_at: string;
    end_at: string | null;
    location: string | null;
    poster_image_url: string | null;
    tags: string[];
}

interface Props {
    events: ActivityEvent[];
}

export function ActivitiesCarousel({ events }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const amount = scrollRef.current.clientWidth * 0.8;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -amount : amount,
            behavior: 'smooth',
        });
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold">Aktiviti & Inisiatif Terkini</h2>
                    <p className="text-[11px] text-muted-foreground">
                        Sertai program komuniti, motivasi remaja dan aktiviti keluarga.
                    </p>
                </div>
                <Link
                    href="/events"
                    className="liquid-btn liquid-btn-emerald text-[11px] py-2 px-3 gap-1.5 shrink-0"
                >
                    <Calendar className="h-3.5 w-3.5" />
                    Lihat Semua
                </Link>
            </div>

            {/* Carousel Content */}
            {!events.length ? (
                <div className="w-full glass-card rounded-2xl p-6 text-center border border-dashed border-border/50">
                    <Calendar className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-xs font-medium text-muted-foreground">Tiada program/aktiviti akan datang setakat ini.</p>
                </div>
            ) : (
                <div className="relative group">
                    {/* Navigation Arrows */}
                    {canScrollLeft && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full glass-heavy flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    )}
                    {canScrollRight && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full glass-heavy flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    )}

                    <div
                        ref={scrollRef}
                        onScroll={checkScroll}
                        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {events.map((event) => (
                            <Link
                                key={event.id}
                                href={`/events/${event.id}`}
                                className="snap-start shrink-0 w-[280px] sm:w-[300px] glass-card rounded-2xl overflow-hidden hover:shadow-lg transition-all group/card"
                            >
                                {/* Poster Image */}
                                <div className="relative w-full h-[180px] bg-muted/30 overflow-hidden">
                                    {event.poster_image_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={event.poster_image_url}
                                            alt={event.title}
                                            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                            <Calendar className="h-10 w-10 text-primary/40" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-3.5 space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span className="text-[10px] font-medium">
                                            {new Date(event.start_at).toLocaleDateString('ms-MY', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                timeZone: 'Asia/Kuala_Lumpur',
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {event.description || 'Acara komuniti yang bakal berlangsung. Klik untuk maklumat penuh.'}
                                    </p>
                                    <div className="flex items-center gap-1 text-primary text-xs font-semibold pt-0.5">
                                        Ketahui Lagi
                                        <ArrowRight className="h-3 w-3 group-hover/card:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
