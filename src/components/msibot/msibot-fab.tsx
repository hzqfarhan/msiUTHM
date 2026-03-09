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
                    'fixed bottom-6 right-4 z-[75] h-16 w-16',
                    'hover:scale-105 active:scale-95 drop-shadow-lg',
                    'transition-all duration-200',
                    open && 'scale-0 opacity-0',
                )}
                aria-label="Buka MSIBOT"
            >
                <div className="relative h-full w-full">
                    <Image
                        src="/msibot/chibi-msi.png"
                        alt="MSIBOT"
                        fill
                        className="object-contain"
                        sizes="64px"
                    />
                    {/* Notification dot (positioned to sit on the chibi head/shoulder) */}
                    <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-accent border-2 border-background animate-pulse" />
                </div>
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
