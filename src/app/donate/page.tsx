/**
 * Donation / Infaq page — full-featured with multiple payment methods,
 * campaigns, copy buttons, QR display, and liquid glass styling.
 */
import { getDonationSettings, getDonationMethods, getDonationCampaigns } from '@/actions/donations';
import { CopyButton } from '@/components/ui/copy-button';
import { PageViewTracker } from '@/components/page-view-tracker';
import { Heart, Building2, QrCode, ExternalLink, Target, Calendar, Phone, Mail, User } from 'lucide-react';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Infaq & Sumbangan',
    description: 'Maklumat sumbangan Masjid Sultan Ibrahim, UTHM',
};

export const revalidate = 300;

export default async function DonatePage() {
    const [settingsResult, methodsResult, campaignsResult] = await Promise.all([
        getDonationSettings(),
        getDonationMethods(),
        getDonationCampaigns(),
    ]);

    const settings = settingsResult.data;
    const methods = methodsResult.data || [];
    const campaigns = campaignsResult.data || [];

    return (
        <div className="space-y-5">
            <PageViewTracker />

            {/* Header */}
            <div className="text-center space-y-2">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                    <Heart className="h-7 w-7 text-rose-600 dark:text-rose-400" />
                </div>
                <h1 className="text-xl font-bold">{settings?.title || 'Infaq & Sumbangan'}</h1>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {settings?.intro_text || 'Sumbangan anda membantu penyelenggaraan dan aktiviti dakwah masjid.'}
                </p>
            </div>

            {/* ─── Donation Methods ─────────────────────────────── */}
            {methods.length > 0 ? (
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold px-1">Cara Menderma</h2>
                    {methods.map((method) => (
                        <div key={method.id} className="glass-card rounded-2xl p-4 space-y-3">
                            {method.method_type === 'bank_transfer' && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                                        <span className="text-sm font-semibold">{method.label}</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2.5 text-sm">
                                        {method.bank_name && (
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Bank</p>
                                                <p className="font-medium">{method.bank_name}</p>
                                            </div>
                                        )}
                                        {method.account_name && (
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nama Akaun</p>
                                                <p className="font-medium">{method.account_name}</p>
                                            </div>
                                        )}
                                        {method.account_number && (
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">No. Akaun</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-mono font-semibold tracking-wider">{method.account_number}</p>
                                                    <CopyButton text={method.account_number} label="No. Akaun" />
                                                </div>
                                            </div>
                                        )}
                                        {method.reference_note && (
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Rujukan</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs">{method.reference_note}</p>
                                                    <CopyButton text={method.reference_note} label="Rujukan" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {method.method_type === 'duitnow_qr' && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <QrCode className="h-4 w-4 text-primary shrink-0" />
                                        <span className="text-sm font-semibold">{method.label}</span>
                                    </div>
                                    {method.qr_image_url && (
                                        <div className="text-center">
                                            <div className="inline-block rounded-xl border border-border/50 p-2 bg-white">
                                                <Image
                                                    src={method.qr_image_url}
                                                    alt={`QR ${method.label}`}
                                                    width={200}
                                                    height={200}
                                                    className="w-48 h-48 object-contain"
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-2">
                                                Imbas QR untuk membuat bayaran
                                            </p>
                                        </div>
                                    )}
                                    {method.reference_note && (
                                        <div className="flex items-center gap-2 justify-center">
                                            <p className="text-xs text-muted-foreground">{method.reference_note}</p>
                                            <CopyButton text={method.reference_note} label="Rujukan" />
                                        </div>
                                    )}
                                </>
                            )}

                            {method.method_type === 'external_link' && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                                        <span className="text-sm font-semibold">{method.label}</span>
                                    </div>
                                    {method.external_url && (
                                        <a
                                            href={method.external_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            Buka Pautan Sumbangan
                                        </a>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ) : settings ? (
                /* Fallback: show legacy donation_info data if no methods defined */
                <div className="glass-card rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-semibold">Maklumat Pindahan Bank</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 text-sm">
                        {settings.bank_name && (
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Bank</p>
                                <p className="font-medium">{settings.bank_name}</p>
                            </div>
                        )}
                        {settings.account_name && (
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nama Akaun</p>
                                <p className="font-medium">{settings.account_name}</p>
                            </div>
                        )}
                        {settings.account_number && (
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">No. Akaun</p>
                                <div className="flex items-center gap-2">
                                    <p className="font-mono font-semibold tracking-wider">{settings.account_number}</p>
                                    <CopyButton text={settings.account_number} label="No. Akaun" />
                                </div>
                            </div>
                        )}
                    </div>
                    {settings.qr_image_url && (
                        <div className="text-center pt-2">
                            <div className="inline-block rounded-xl border border-border/50 p-2 bg-white">
                                <Image
                                    src={settings.qr_image_url}
                                    alt="QR Code Sumbangan"
                                    width={200}
                                    height={200}
                                    className="w-48 h-48 object-contain"
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2">Imbas QR untuk membuat bayaran</p>
                        </div>
                    )}
                    {settings.notes && (
                        <p className="text-xs text-muted-foreground italic border-t border-border/30 pt-3">{settings.notes}</p>
                    )}
                </div>
            ) : (
                /* Empty state */
                <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
                    <Heart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Maklumat sumbangan belum dikemaskini.</p>
                    <p className="text-xs mt-1">Sila semak semula nanti.</p>
                </div>
            )}

            {/* ─── Campaigns ──────────────────────────────────── */}
            {campaigns.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold px-1">Kempen Sumbangan</h2>
                    {campaigns.map((campaign) => {
                        const progress = campaign.target_amount && campaign.current_amount
                            ? Math.min(100, (campaign.current_amount / campaign.target_amount) * 100)
                            : null;

                        return (
                            <div key={campaign.id} className="glass-card rounded-2xl p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                        <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm">{campaign.title}</h3>
                                        {campaign.description && (
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{campaign.description}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Progress bar */}
                                {progress !== null && campaign.target_amount && (
                                    <div className="space-y-1.5">
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                            <span>RM {(campaign.current_amount || 0).toLocaleString()}</span>
                                            <span>RM {campaign.target_amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Date range */}
                                {(campaign.start_date || campaign.end_date) && (
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {campaign.start_date && (
                                            <span>{new Date(campaign.start_date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        )}
                                        {campaign.start_date && campaign.end_date && <span>—</span>}
                                        {campaign.end_date && (
                                            <span>{new Date(campaign.end_date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── Contact Info ────────────────────────────────── */}
            {settings && (settings.contact_name || settings.contact_phone || settings.contact_email) && (
                <div className="glass-card rounded-2xl p-4 space-y-2">
                    <h2 className="text-sm font-semibold">Pengesahan & Hubungi</h2>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                        {settings.contact_name && (
                            <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5" />
                                <span>{settings.contact_name}</span>
                            </div>
                        )}
                        {settings.contact_phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5" />
                                <a href={`tel:${settings.contact_phone}`} className="hover:text-primary transition-colors">{settings.contact_phone}</a>
                            </div>
                        )}
                        {settings.contact_email && (
                            <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5" />
                                <a href={`mailto:${settings.contact_email}`} className="hover:text-primary transition-colors">{settings.contact_email}</a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── Disclaimer ─────────────────────────────────── */}
            <p className="text-[10px] text-center text-muted-foreground px-4">
                ⚠️ {settings?.disclaimer_text || 'Ini hanya maklumat rujukan. Tiada pemprosesan bayaran dilakukan melalui aplikasi ini.'}
            </p>

            {/* ─── Last Updated ────────────────────────────────── */}
            {settings?.updated_at && (
                <p className="text-[9px] text-center text-muted-foreground">
                    Dikemas kini: {new Date(settings.updated_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            )}
        </div>
    );
}
