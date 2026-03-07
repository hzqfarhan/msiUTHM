/**
 * Feedback / Report Issue page.
 */
import { FeedbackForm } from '@/components/feedback/feedback-form';
import { PageViewTracker } from '@/components/page-view-tracker';
import { QrScanTracker } from '@/components/qr-scan-tracker';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Lapor Isu',
    description: 'Laporkan isu atau beri maklum balas tentang kemudahan MSI UTHM',
};

export default function FeedbackPage() {
    return (
        <div className="space-y-4">
            <PageViewTracker />
            <Suspense><QrScanTracker /></Suspense>
            <div>
                <h1 className="text-xl font-bold">Lapor Isu / Maklum Balas</h1>
                <p className="text-sm text-muted-foreground">
                    Bantu kami menjaga kebersihan dan kemudahan masjid.
                </p>
            </div>
            <FeedbackForm />
        </div>
    );
}
