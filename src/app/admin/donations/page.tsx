'use client';

import { useEffect, useState, useCallback } from 'react';
import { Heart, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/client';
import {
    getDonationSettings, updateDonationSettings, type DonationSettings
} from '@/actions/donations';

export default function AdminDonationsPage() {
    const [settings, setSettings] = useState<Partial<DonationSettings> | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        const s = await getDonationSettings();
        if (s.data) {
            setSettings(s.data);
        } else {
            // Emulate an empty draft state for form interaction
            setSettings({
                title: '',
                intro_text: '',
                qr_image_url: '',
                notes: '',
                mosque_id: 'default_mosque'
            });
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSaveSettings = async () => {
        if (!settings) return;
        setSaving(true);

        const { error } = await updateDonationSettings({
            title: settings.title,
            intro_text: settings.intro_text,
            qr_image_url: settings.qr_image_url,
            notes: settings.notes,
        });
        setSaving(false);
        showMessage(error ? 'error' : 'success', error || 'Tetapan berjaya disimpan!');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4 w-full">
            <div>
                <h2 className="text-xl font-bold">Pengurusan Sumbangan (QR)</h2>
                <p className="text-sm text-muted-foreground">Urus gambar QR dan maklumat paparan infaq.</p>
            </div>

            {message && (
                <div className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium animate-in slide-in-from-top-2',
                    message.type === 'success' ? 'bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-destructive/15 text-destructive',
                )}>
                    {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {message.text}
                </div>
            )}

            <div className="glass-card rounded-2xl p-5 space-y-4">
                <InputField label="Tajuk Halaman (Cth: Tabung Pembangunan Masjid)" value={settings?.title || ''} onChange={v => setSettings({ ...settings, title: v } as DonationSettings)} />

                <TextareaField label="Teks Pengenalan" value={settings?.intro_text || ''} onChange={v => setSettings({ ...settings, intro_text: v } as DonationSettings)} />

                <InputField label="Pautan / URL Imej QR (Sila muat naik gambar di tempat lain dan letak link di sini)" value={settings?.qr_image_url || ''} onChange={v => setSettings({ ...settings, qr_image_url: v } as DonationSettings)} />

                {settings?.qr_image_url && (
                    <div className="mt-2 p-4 border border-border/50 rounded-xl bg-white/5 inline-block text-center w-full">
                        <p className="text-xs text-muted-foreground mb-2">Pratonton QR:</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={settings.qr_image_url} alt="QR Preview" className="w-40 h-40 object-contain mx-auto" onError={(e) => e.currentTarget.style.display = 'none'} />
                    </div>
                )}

                <TextareaField label="Nota / Nombor Rujukan (Jika Ada)" value={settings?.notes || ''} onChange={v => setSettings({ ...settings, notes: v } as DonationSettings)} />

                <div className="pt-2">
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all w-full justify-center"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Simpan Paparan Sumbangan
                    </button>
                </div>
            </div>
        </div>
    );
}

function InputField({ label, value, onChange, type = 'text' }: {
    label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
    return (
        <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full h-11 rounded-xl glass-input px-3 text-sm placeholder:text-muted-foreground/50"
            />
        </div>
    );
}

function TextareaField({ label, value, onChange }: {
    label: string; value: string; onChange: (v: string) => void;
}) {
    return (
        <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">{label}</label>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                rows={4}
                className="w-full rounded-xl glass-input px-3 py-2.5 text-sm resize-none placeholder:text-muted-foreground/50"
            />
        </div>
    );
}
