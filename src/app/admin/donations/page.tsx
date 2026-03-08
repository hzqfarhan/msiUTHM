/**
 * Admin Donations page — manage donation settings, methods, and campaigns.
 * Uses glass styling and liquid glass cards matching the admin layout.
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    Heart, Building2, QrCode, ExternalLink, Plus, Pencil, Trash2,
    Save, Target, ToggleLeft, ToggleRight, AlertCircle, CheckCircle, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    getDonationSettings, getAdminDonationMethods, getAdminDonationCampaigns,
    updateDonationSettings, createDonationMethod, updateDonationMethod, deleteDonationMethod,
    createDonationCampaign, updateDonationCampaign, deleteDonationCampaign,
    type DonationSettings, type DonationMethod, type DonationCampaign,
} from '@/actions/donations';

type Tab = 'settings' | 'methods' | 'campaigns';

export default function AdminDonationsPage() {
    const [tab, setTab] = useState<Tab>('settings');
    const [settings, setSettings] = useState<DonationSettings | null>(null);
    const [methods, setMethods] = useState<DonationMethod[]>([]);
    const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        const [s, m, c] = await Promise.all([
            getDonationSettings(),
            getAdminDonationMethods(),
            getAdminDonationCampaigns(),
        ]);
        if (s.data) setSettings(s.data);
        if (m.data) setMethods(m.data);
        if (c.data) setCampaigns(c.data);
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    // ─── Settings Save ──────────────────────────────────
    const handleSaveSettings = async () => {
        if (!settings) return;
        setSaving(true);
        const { error } = await updateDonationSettings({
            title: settings.title,
            intro_text: settings.intro_text,
            disclaimer_text: settings.disclaimer_text,
            contact_name: settings.contact_name,
            contact_phone: settings.contact_phone,
            contact_email: settings.contact_email,
        });
        setSaving(false);
        showMessage(error ? 'error' : 'success', error || 'Tetapan berjaya disimpan!');
    };

    // ─── Method Toggle ──────────────────────────────────
    const toggleMethod = async (id: string, active: boolean) => {
        const { error } = await updateDonationMethod(id, { is_active: active });
        if (!error) setMethods(prev => prev.map(m => m.id === id ? { ...m, is_active: active } : m));
        else showMessage('error', error);
    };

    const handleDeleteMethod = async (id: string) => {
        if (!confirm('Padam kaedah sumbangan ini?')) return;
        const { error } = await deleteDonationMethod(id);
        if (!error) { setMethods(prev => prev.filter(m => m.id !== id)); showMessage('success', 'Dipadam.'); }
        else showMessage('error', error);
    };

    // ─── Campaign Toggle ────────────────────────────────
    const toggleCampaign = async (id: string, active: boolean) => {
        const { error } = await updateDonationCampaign(id, { is_active: active });
        if (!error) setCampaigns(prev => prev.map(c => c.id === id ? { ...c, is_active: active } : c));
        else showMessage('error', error);
    };

    const handleDeleteCampaign = async (id: string) => {
        if (!confirm('Padam kempen ini?')) return;
        const { error } = await deleteDonationCampaign(id);
        if (!error) { setCampaigns(prev => prev.filter(c => c.id !== id)); showMessage('success', 'Dipadam.'); }
        else showMessage('error', error);
    };

    // ─── Quick Add Method ───────────────────────────────
    const handleAddMethod = async () => {
        setSaving(true);
        const { data, error } = await createDonationMethod({
            method_type: 'bank_transfer',
            label: 'Kaedah Baharu',
            bank_name: null, account_number: null, account_name: null,
            reference_note: null, qr_image_url: null, external_url: null,
            is_active: false, sort_order: methods.length,
        });
        setSaving(false);
        if (data) { setMethods(prev => [...prev, data]); showMessage('success', 'Kaedah ditambah. Sila kemaskini maklumat.'); }
        else showMessage('error', error || 'Gagal menambah.');
    };

    // ─── Quick Add Campaign ─────────────────────────────
    const handleAddCampaign = async () => {
        setSaving(true);
        const { data, error } = await createDonationCampaign({
            title: 'Kempen Baharu',
            description: null, target_amount: null, current_amount: null,
            start_date: null, end_date: null,
            is_active: false, sort_order: campaigns.length,
        });
        setSaving(false);
        if (data) { setCampaigns(prev => [...prev, data]); showMessage('success', 'Kempen ditambah.'); }
        else showMessage('error', error || 'Gagal menambah.');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold">Pengurusan Sumbangan</h2>
                <p className="text-sm text-muted-foreground">Urus maklumat infaq, kaedah bayaran, dan kempen.</p>
            </div>

            {/* Toast */}
            {message && (
                <div className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium animate-in slide-in-from-top-2',
                    message.type === 'success' ? 'bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-destructive/15 text-destructive',
                )}>
                    {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {message.text}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl glass-card">
                {([
                    { key: 'settings' as Tab, label: 'Tetapan', icon: Heart },
                    { key: 'methods' as Tab, label: 'Kaedah Bayaran', icon: Building2 },
                    { key: 'campaigns' as Tab, label: 'Kempen', icon: Target },
                ]).map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all',
                            tab === t.key ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <t.icon className="h-3.5 w-3.5" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ─── SETTINGS TAB ───────────────────────────── */}
            {tab === 'settings' && settings && (
                <div className="glass-card rounded-2xl p-4 space-y-4">
                    <InputField label="Tajuk Halaman" value={settings.title || ''} onChange={v => setSettings({ ...settings, title: v })} />
                    <TextareaField label="Teks Pengenalan" value={settings.intro_text || ''} onChange={v => setSettings({ ...settings, intro_text: v })} />
                    <TextareaField label="Teks Penafian" value={settings.disclaimer_text || ''} onChange={v => setSettings({ ...settings, disclaimer_text: v })} />
                    <InputField label="Nama Kenalan" value={settings.contact_name || ''} onChange={v => setSettings({ ...settings, contact_name: v })} />
                    <InputField label="Telefon" value={settings.contact_phone || ''} onChange={v => setSettings({ ...settings, contact_phone: v })} />
                    <InputField label="E-mel" value={settings.contact_email || ''} onChange={v => setSettings({ ...settings, contact_email: v })} />
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Simpan Tetapan
                    </button>
                </div>
            )}

            {/* ─── METHODS TAB ────────────────────────────── */}
            {tab === 'methods' && (
                <div className="space-y-3">
                    <button onClick={handleAddMethod} disabled={saving} className="flex items-center gap-2 px-3 py-2 rounded-xl glass-button text-sm font-medium hover:text-foreground transition-all">
                        <Plus className="h-4 w-4" /> Tambah Kaedah
                    </button>
                    {methods.length === 0 && (
                        <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
                            <p className="text-sm">Tiada kaedah sumbangan. Klik butang di atas untuk mula.</p>
                        </div>
                    )}
                    {methods.map(method => (
                        <MethodCard
                            key={method.id}
                            method={method}
                            onToggle={(active) => toggleMethod(method.id, active)}
                            onDelete={() => handleDeleteMethod(method.id)}
                            onUpdate={async (updates) => {
                                const { error } = await updateDonationMethod(method.id, updates);
                                if (!error) { setMethods(prev => prev.map(m => m.id === method.id ? { ...m, ...updates } : m)); showMessage('success', 'Dikemaskini.'); }
                                else showMessage('error', error);
                            }}
                        />
                    ))}
                </div>
            )}

            {/* ─── CAMPAIGNS TAB ─────────────────────────── */}
            {tab === 'campaigns' && (
                <div className="space-y-3">
                    <button onClick={handleAddCampaign} disabled={saving} className="flex items-center gap-2 px-3 py-2 rounded-xl glass-button text-sm font-medium hover:text-foreground transition-all">
                        <Plus className="h-4 w-4" /> Tambah Kempen
                    </button>
                    {campaigns.length === 0 && (
                        <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
                            <p className="text-sm">Tiada kempen. Klik butang di atas untuk mula.</p>
                        </div>
                    )}
                    {campaigns.map(campaign => (
                        <CampaignCard
                            key={campaign.id}
                            campaign={campaign}
                            onToggle={(active) => toggleCampaign(campaign.id, active)}
                            onDelete={() => handleDeleteCampaign(campaign.id)}
                            onUpdate={async (updates) => {
                                const { error } = await updateDonationCampaign(campaign.id, updates);
                                if (!error) { setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, ...updates } : c)); showMessage('success', 'Dikemaskini.'); }
                                else showMessage('error', error);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Inline sub-components ──────────────────────────────────

function InputField({ label, value, onChange, type = 'text' }: {
    label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
    return (
        <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full mt-1 h-10 rounded-xl glass-input px-3 text-sm"
            />
        </div>
    );
}

function TextareaField({ label, value, onChange }: {
    label: string; value: string; onChange: (v: string) => void;
}) {
    return (
        <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</label>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                rows={3}
                className="w-full mt-1 rounded-xl glass-input px-3 py-2.5 text-sm resize-none"
            />
        </div>
    );
}

function MethodCard({ method, onToggle, onDelete, onUpdate }: {
    method: DonationMethod;
    onToggle: (active: boolean) => void;
    onDelete: () => void;
    onUpdate: (updates: Partial<DonationMethod>) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(method);

    const typeIcons = { bank_transfer: Building2, duitnow_qr: QrCode, external_link: ExternalLink };
    const Icon = typeIcons[method.method_type] || Building2;

    return (
        <div className={cn('glass-card rounded-2xl p-4 space-y-3', !method.is_active && 'opacity-60')}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{method.label}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{method.method_type}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => onToggle(!method.is_active)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title={method.is_active ? 'Nyahaktif' : 'Aktifkan'}>
                        {method.is_active ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <button onClick={() => { setForm(method); setEditing(!editing); }} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {editing && (
                <div className="space-y-3 border-t border-border/30 pt-3">
                    <InputField label="Label" value={form.label} onChange={v => setForm({ ...form, label: v })} />
                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Jenis</label>
                        <select
                            value={form.method_type}
                            onChange={e => setForm({ ...form, method_type: e.target.value as DonationMethod['method_type'] })}
                            className="w-full mt-1 h-10 rounded-xl glass-input px-3 text-sm"
                        >
                            <option value="bank_transfer">Pindahan Bank</option>
                            <option value="duitnow_qr">DuitNow QR</option>
                            <option value="external_link">Pautan Luar</option>
                        </select>
                    </div>
                    {form.method_type === 'bank_transfer' && (
                        <>
                            <InputField label="Nama Bank" value={form.bank_name || ''} onChange={v => setForm({ ...form, bank_name: v })} />
                            <InputField label="Nama Akaun" value={form.account_name || ''} onChange={v => setForm({ ...form, account_name: v })} />
                            <InputField label="No. Akaun" value={form.account_number || ''} onChange={v => setForm({ ...form, account_number: v })} />
                        </>
                    )}
                    {form.method_type === 'duitnow_qr' && (
                        <InputField label="URL Imej QR" value={form.qr_image_url || ''} onChange={v => setForm({ ...form, qr_image_url: v })} />
                    )}
                    {form.method_type === 'external_link' && (
                        <InputField label="URL Pautan" value={form.external_url || ''} onChange={v => setForm({ ...form, external_url: v })} />
                    )}
                    <InputField label="Nota Rujukan" value={form.reference_note || ''} onChange={v => setForm({ ...form, reference_note: v })} />
                    <button
                        onClick={() => { onUpdate(form); setEditing(false); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all"
                    >
                        <Save className="h-3.5 w-3.5" /> Simpan
                    </button>
                </div>
            )}
        </div>
    );
}

function CampaignCard({ campaign, onToggle, onDelete, onUpdate }: {
    campaign: DonationCampaign;
    onToggle: (active: boolean) => void;
    onDelete: () => void;
    onUpdate: (updates: Partial<DonationCampaign>) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(campaign);

    return (
        <div className={cn('glass-card rounded-2xl p-4 space-y-3', !campaign.is_active && 'opacity-60')}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold">{campaign.title}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => onToggle(!campaign.is_active)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        {campaign.is_active ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <button onClick={() => { setForm(campaign); setEditing(!editing); }} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {editing && (
                <div className="space-y-3 border-t border-border/30 pt-3">
                    <InputField label="Tajuk" value={form.title} onChange={v => setForm({ ...form, title: v })} />
                    <TextareaField label="Penerangan" value={form.description || ''} onChange={v => setForm({ ...form, description: v })} />
                    <div className="grid grid-cols-2 gap-3">
                        <InputField label="Sasaran (RM)" value={String(form.target_amount || '')} onChange={v => setForm({ ...form, target_amount: v ? parseFloat(v) : null })} type="number" />
                        <InputField label="Semasa (RM)" value={String(form.current_amount || '')} onChange={v => setForm({ ...form, current_amount: v ? parseFloat(v) : null })} type="number" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <InputField label="Tarikh Mula" value={form.start_date || ''} onChange={v => setForm({ ...form, start_date: v || null })} type="date" />
                        <InputField label="Tarikh Tamat" value={form.end_date || ''} onChange={v => setForm({ ...form, end_date: v || null })} type="date" />
                    </div>
                    <button
                        onClick={() => { onUpdate(form); setEditing(false); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all"
                    >
                        <Save className="h-3.5 w-3.5" /> Simpan
                    </button>
                </div>
            )}
        </div>
    );
}
