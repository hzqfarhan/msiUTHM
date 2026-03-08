'use client';

import { useEffect, useState, useCallback } from 'react';
import { Heart, Save, AlertCircle, CheckCircle, Loader2, Upload, X, ImageIcon } from 'lucide-react';
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
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Simulate progress since Supabase js doesn't have native upload progress yet
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 100);

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            clearInterval(progressInterval);

            if (uploadError) {
                showMessage('error', `Ralat memuat naik gambar: ${uploadError.message}`);
                setUploading(false);
                return;
            }

            setUploadProgress(100);

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setSettings(prev => ({ ...prev, qr_image_url: publicUrl } as DonationSettings));
            showMessage('success', 'Gambar QR berjaya dimuat naik (Sila tekan Simpan)');
        } catch (error: any) {
            showMessage('error', `Ralat tidak dijangka: ${error.message}`);
        } finally {
            setUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
            if (e.target) e.target.value = ''; // Reset input
        }
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

                <div>
                    <label className="text-xs font-semibold text-foreground mb-2 block">Imej QR Kod</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                        {settings?.qr_image_url ? (
                            <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-border/50 bg-secondary/5 group shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={settings.qr_image_url} alt="QR Preview" className="w-full h-full object-contain p-2" />
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, qr_image_url: '' } as DonationSettings)}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="w-40 h-40 rounded-xl border border-dashed border-border/50 bg-secondary/5 flex flex-col items-center justify-center shrink-0">
                                <ImageIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">Tiada QR</span>
                            </div>
                        )}
                        <div className="flex-1 w-full space-y-3">
                            <label className="flex items-center justify-center gap-2 w-full h-11 rounded-button bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground text-sm font-medium transition-colors cursor-pointer border border-secondary/20">
                                <Upload className="h-4 w-4" />
                                {uploading ? `Memuat naik... ${uploadProgress}%` : 'Muat Naik Gambar QR'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                            </label>
                            <p className="text-xs text-muted-foreground leading-relaxed">Muat naik gambar kod QR DuitNow atau akaun bank untuk paparan infaq.</p>

                            {/* Fallback URL input in case they really want to just paste a URL */}
                            <div className="pt-2 border-t border-border/30">
                                <label className="text-[10px] font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">Atau Guna Pautan Berasingan</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={settings?.qr_image_url || ''}
                                    onChange={e => setSettings({ ...settings, qr_image_url: e.target.value } as DonationSettings)}
                                    className="w-full h-9 rounded-lg glass-input px-3 text-xs placeholder:text-muted-foreground/50 border-border/30"
                                />
                            </div>
                        </div>
                    </div>
                </div>

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
