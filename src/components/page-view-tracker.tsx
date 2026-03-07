/**
 * Page view tracker — fires analytics on mount.
 */
'use client';

import { useEffect } from 'react';
import { trackPageView } from '@/services/analytics';

export function PageViewTracker() {
    useEffect(() => {
        trackPageView();
    }, []);

    return null;
}
