import { getDonationSettings } from '@/actions/donations';
import { PageViewTracker } from '@/components/page-view-tracker';
import { Heart, ScanLine } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Infaq & Sumbangan',
    description: 'Sebarkan kebaikan melalui sumbangan untuk masjid.',
};

export const revalidate = 60; // 1 min revalidate so they see changes relatively soon

export default async function DonatePage() {
    const settingsResult = await getDonationSettings();
    const settings = settingsResult.data;

    return (
        <div className="space-y-6">
            <PageViewTracker />

            {/* Header */}
            <div className="text-center space-y-3 pt-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {settings?.title || 'Infaq & Sumbangan'}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
                        {settings?.intro_text || 'Sumbangan anda memastikan rumah Allah ini kekal subur menabur bakti kepada komuniti.'}
                    </p>
                </div>
            </div>

            {/* Main QR Card */}
            {settings?.qr_image_url ? (
                <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md mx-auto text-center space-y-6 relative overflow-hidden">
                    {/* Decorative Background Blur */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                    <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        <ScanLine className="h-3.5 w-3.5" />
                        Imbas kod QR di bawah
                    </div>

                    <div className="relative mx-auto w-64 h-64 p-3 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center">
                        {/* Using standard img for external arbitrary URLs without needing domains configured in next.config.js */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={settings.qr_image_url}
                            alt="QR Code Sumbangan"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>

                    {settings.notes && (
                        <div className="bg-muted/50 rounded-xl p-4 text-sm text-foreground/80 leading-relaxed border border-border/50">
                            {settings.notes}
                        </div>
                    )}
                </div>
            ) : (
                <div className="glass-card rounded-3xl p-10 max-w-md mx-auto text-center">
                    <Heart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="font-medium text-foreground">Maklumat Infaq Belum Dikemaskini</p>
                    <p className="text-xs text-muted-foreground mt-2">Sila semak semula nanti untuk menyumbang.</p>
                </div>
            )}
        </div>
    );
}
