/**
 * QR Scan Tracker — reads `src` query param and logs qr_scan analytics event.
 * Used on pages that can be reached via QR codes.
 */
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackEvent } from '@/services/analytics';

export function QrScanTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const src = searchParams.get('src');
        if (src && src.startsWith('qr_')) {
            trackEvent('qr_scan', {
                metadata: { src, path: window.location.pathname },
            });
        }
    }, [searchParams]);

    return null;
}
