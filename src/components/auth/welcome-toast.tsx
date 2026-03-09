'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function WelcomeToast() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const isFirstLogin = searchParams.get('firstLogin') === 'true';

        if (isFirstLogin) {
            // Show the welcome message
            toast.success('Terima kasih kerana mendaftar dengan MSI UTHM Companion!', {
                duration: 5000,
                position: 'top-center',
            });

            // Clean up the URL to remove the query parameter without refreshing
            const url = new URL(window.location.href);
            url.searchParams.delete('firstLogin');
            window.history.replaceState({}, '', url.toString());
        }
    }, [searchParams]);

    return null; // This component doesn't render any visible DOM on its own
}
