/**
 * MSIBOT Floating Action Button — triggers the chat panel.
 * Lazy-loads the chat panel only when first opened.
 */
'use client';

import { useState, lazy, Suspense } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { toast } from 'sonner';

// Lazy-load the chat panel so it doesn't slow down initial page load
const MsibotChat = lazy(() =>
    import('./msibot-chat').then(m => ({ default: m.MsibotChat }))
);

export function MsibotFab() {
    const [open, setOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const profile = useProfile();

    // Hide on admin pages
    if (pathname.startsWith('/admin')) return null;

    const handleOpen = () => {
        if (!profile) {
            toast.error('Sila log masuk untuk menggunakan MSIBOT.');
            router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }
        setLoaded(true); // trigger lazy load
        setOpen(true);
    };

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => (open ? setOpen(false) : handleOpen())}
                className={cn(
                    'fixed bottom-2 right-2 z-[75] h-32 w-32 md:bottom-6 md:right-4 md:h-40 md:w-40',
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
                        className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] md:drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]"
                        sizes="(max-width: 768px) 128px, 160px"
                        priority
                    />
                    {/* Notification dot (positioned to sit on the chibi head/shoulder) */}
                    <span className="absolute top-[15%] right-[20%] h-3.5 w-3.5 md:h-4 md:w-4 rounded-full bg-accent border-[3px] border-background animate-pulse shadow-lg" />
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
