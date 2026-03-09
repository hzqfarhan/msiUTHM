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
                    'fixed bottom-2 right-2 z-[75] h-64 w-64 md:bottom-6 md:right-4',
                    'hover:scale-105 active:scale-95 drop-shadow-xl',
                    'transition-all duration-300',
                    open && 'scale-0 opacity-0 pointer-events-none cursor-default',
                )}
                aria-label="Buka MSIBOT"
            >
                <div className="relative h-full w-full">
                    <Image
                        src="/msibot/chibi-msi.png"
                        alt="MSIBOT"
                        fill
                        className="object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]"
                        sizes="256px"
                        priority
                    />
                    {/* Notification dot (positioned to sit on the chibi head/shoulder) */}
                    <span className="absolute top-[15%] right-[20%] h-5 w-5 rounded-full bg-accent border-4 border-background animate-pulse shadow-lg" />
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
