/**
 * Offline banner — shows when user loses internet connection.
 */
'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
    const isOnline = useOnlineStatus();

    if (isOnline) return null;

    return (
        <div className="fixed top-14 left-0 right-0 z-40 bg-amber-500 text-amber-950 text-center py-1.5 px-4 text-xs font-medium">
            <WifiOff className="inline h-3 w-3 mr-1" />
            Anda sedang luar talian. Data mungkin tidak terkini.
        </div>
    );
}
