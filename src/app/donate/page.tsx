/**
 * Donation / Infaq page — shows bank info and QR.
 */
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_MOSQUE_ID } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Copy } from 'lucide-react';
import { PageViewTracker } from '@/components/page-view-tracker';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Infaq & Sumbangan',
    description: 'Maklumat sumbangan Masjid Sultan Ibrahim, UTHM',
};

export default async function DonatePage() {
    const supabase = await createClient();
    const { data: donation } = await supabase
        .from('donation_info')
        .select('*')
        .eq('mosque_id', DEFAULT_MOSQUE_ID)
        .single();

    return (
        <div className="space-y-4">
            <PageViewTracker />
            <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <h1 className="text-xl font-bold">Infaq & Sumbangan</h1>
                <p className="text-sm text-muted-foreground">
                    Sumbangan anda membantu penyelenggaraan dan aktiviti dakwah masjid.
                </p>
            </div>

            {donation ? (
                <Card className="border-border/50">
                    <CardContent className="p-5 space-y-4">
                        {/* Bank info */}
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Bank</p>
                                <p className="font-medium text-sm">{donation.bank_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nama Akaun</p>
                                <p className="font-medium text-sm">{donation.account_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">No. Akaun</p>
                                <div className="flex items-center gap-2">
                                    <p className="font-mono font-semibold text-sm tracking-wider">{donation.account_number || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* QR Image */}
                        {donation.qr_image_url && (
                            <div className="text-center">
                                <img
                                    src={donation.qr_image_url}
                                    alt="QR Code Sumbangan"
                                    className="mx-auto w-48 h-48 rounded-lg border border-border"
                                />
                                <p className="text-[10px] text-muted-foreground mt-2">Imbas QR untuk membuat bayaran</p>
                            </div>
                        )}

                        {/* Notes */}
                        {donation.notes && (
                            <p className="text-xs text-muted-foreground italic border-t border-border/50 pt-3">
                                {donation.notes}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <p>Maklumat sumbangan belum dikemaskini.</p>
                    </CardContent>
                </Card>
            )}

            <p className="text-[10px] text-center text-muted-foreground">
                ⚠️ Ini hanya maklumat rujukan. Tiada pemprosesan bayaran dilakukan melalui aplikasi ini.
            </p>
        </div>
    );
}
