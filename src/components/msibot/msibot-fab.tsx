/**
 * MSIBOT Floating Action Button — triggers the chat panel.
 * Lazy-loads the chat panel only when first opened.
 */
'use client';

import { useState, lazy, Suspense } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

// Lazy-load the chat panel so it doesn't slow down initial page load
const MsibotChat = lazy(() =>
    import('./msibot-chat').then(m => ({ default: m.MsibotChat }))
);

export function MsibotFab() {
    const [open, setOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const pathname = usePathname();

    // Hide on admin pages
    if (pathname.startsWith('/admin')) return null;

    const handleOpen = () => {
        setLoaded(true); // trigger lazy load
        setOpen(true);
    };

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => (open ? setOpen(false) : handleOpen())}
                className={cn(
                    'fixed bottom-6 right-4 z-[75] h-14 w-14 rounded-2xl',
                    'flex items-center justify-center',
                    'bg-primary text-primary-foreground shadow-lg',
                    'hover:bg-primary/90 hover:scale-105',
                    'active:scale-95',
                    'transition-all duration-200',
                    // Subtle glow effect
                    'shadow-[0_4px_24px_rgba(0,198,200,0.3)]',
                    open && 'scale-0 opacity-0',
                )}
                aria-label="Buka MSIBOT"
            >
                <div className="relative h-10 w-10 overflow-hidden rounded-xl">
                    <Image
                        src="/msibot/chibi-msi.png"
                        alt="MSIBOT"
                        fill
                        className="object-contain"
                        sizes="40px"
                    />
                </div>
                {/* Notification dot */}
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-accent border-2 border-background animate-pulse" />
            </button>

            {/* Chat panel (lazy loaded) */}
            {loaded && (
                <Suspense fallback={null}>
                    <MsibotChat open={open} onClose={() => setOpen(false)} />
                </Suspense>
            )}
        </>
    );
}
