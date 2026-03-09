/**
 * LiveNewsTicker — smooth, infinitely scrolling marquee.
 *
 * Uses pure CSS translateX animation for buttery 60 fps.
 * Content is duplicated so the loop is seamless.
 * Pauses on hover. Respects prefers-reduced-motion.
 */
'use client';

import { cn } from '@/lib/utils';
import type { TickerItem } from '@/lib/ticker';

interface LiveNewsTickerProps {
    items: TickerItem[];
    /** Animation duration in seconds (lower = faster). Default 40. */
    speed?: number;
    className?: string;
}

function TickerContent({ items }: { items: TickerItem[] }) {
    return (
        <>
            {items.map((item, i) => (
                <span key={`${item.id}-${i}`} className="inline-flex items-center shrink-0 gap-1.5 whitespace-nowrap">
                    <span className="text-white/70 text-[11px] font-medium tracking-wide">
                        {item.text}
                    </span>
                    {item.highlight && (
                        <span className="text-[#4FE0E3] text-[11px] font-bold tracking-wide">
                            {item.highlight}
                        </span>
                    )}
                    {/* Separator dot */}
                    <span className="text-[#00C6C8]/40 mx-3 text-xs select-none" aria-hidden="true">•</span>
                </span>
            ))}
        </>
    );
}

export function LiveNewsTicker({ items, speed = 40, className }: LiveNewsTickerProps) {
    if (!items.length) return null;

    return (
        <div
            role="marquee"
            aria-label="Maklumat terkini MSI UTHM"
            className={cn(
                'relative w-full overflow-hidden select-none',
                // Push down on mobile to clear the fixed 3.5rem (56px) header
                'mt-14 lg:mt-0',
                // Dark translucent background with subtle border
                'bg-[#0B1E4A]/90 backdrop-blur-sm',
                'border-b border-[#00C6C8]/10',
                className,
            )}
            style={{ height: '32px' }}
        >
            {/* Left fade */}
            <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-r from-[#0B1E4A] to-transparent" />
            {/* Right fade */}
            <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-l from-[#0B1E4A] to-transparent" />

            {/* Scrolling track — hover pauses, reduced motion shows static */}
            <div
                className="ticker-track flex items-center h-full"
                style={{ '--ticker-speed': `${speed}s` } as React.CSSProperties}
            >
                {/* Duplicate content for seamless infinite loop */}
                <div className="ticker-content flex items-center shrink-0 pr-8">
                    <TickerContent items={items} />
                </div>
                <div className="ticker-content flex items-center shrink-0 pr-8" aria-hidden="true">
                    <TickerContent items={items} />
                </div>
            </div>
        </div>
    );
}
