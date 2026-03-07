/**
 * Admin QR Generator — generates QR codes for events, onboarding, facilities.
 * Glass morphism styling.
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, QrCode, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

type QRType = 'event' | 'onboarding' | 'facility' | 'custom';

const presets: { type: QRType; label: string; pathTemplate: string; placeholder: string }[] = [
    { type: 'event', label: 'Program', pathTemplate: '/events/{id}?src=qr_poster', placeholder: 'Event ID' },
    { type: 'onboarding', label: 'Onboarding', pathTemplate: '/?src=qr_entrance', placeholder: '' },
    { type: 'facility', label: 'Lapor Isu Fasiliti', pathTemplate: '/feedback?facility_id={id}&src=qr_toilet', placeholder: 'Facility ID' },
    { type: 'custom', label: 'Pautan Khas', pathTemplate: '{id}', placeholder: 'Full path (e.g. /events/abc)' },
];

export function QRGenerator() {
    const [selectedType, setSelectedType] = useState<QRType>('event');
    const [inputValue, setInputValue] = useState('');
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const preset = presets.find(p => p.type === selectedType)!;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://msi-uthm.vercel.app';

    const generateUrl = (): string => {
        const path = preset.pathTemplate.replace('{id}', inputValue);
        if (selectedType === 'onboarding') return `${baseUrl}${path}`;
        if (selectedType === 'custom') return `${baseUrl}${inputValue}`;
        return `${baseUrl}${path}`;
    };

    const generateQR = async () => {
        const url = generateUrl();
        if (!url) return;

        try {
            const dataUrl = await QRCode.toDataURL(url, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#0f172a',
                    light: '#ffffff',
                },
                errorCorrectionLevel: 'H',
            });
            setQrDataUrl(dataUrl);
        } catch {
            toast.error('Gagal menjana QR code');
        }
    };

    const downloadQR = () => {
        if (!qrDataUrl) return;
        const link = document.createElement('a');
        link.download = `qr-${selectedType}-${Date.now()}.png`;
        link.href = qrDataUrl;
        link.click();
    };

    const copyUrl = async () => {
        const url = generateUrl();
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('URL disalin!');
        setTimeout(() => setCopied(false), 2000);
    };

    // Auto-generate for onboarding (no input needed)
    useEffect(() => {
        if (selectedType === 'onboarding') {
            generateQR();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedType]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold">Penjana QR Code</h1>
                <p className="text-sm text-muted-foreground">Jana QR code untuk program, fasiliti, atau onboarding.</p>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presets.map((p) => (
                    <button
                        key={p.type}
                        onClick={() => { setSelectedType(p.type); setQrDataUrl(null); setInputValue(''); }}
                        className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${selectedType === p.type
                                ? 'glass-button glow-emerald text-emerald-500'
                                : 'glass-card text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Input + Generate */}
            {preset.placeholder && (
                <div className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={preset.placeholder}
                        className="glass-input rounded-xl"
                    />
                    <Button onClick={generateQR} disabled={!inputValue} className="glass-button rounded-xl border-emerald-500/30 text-emerald-500 shrink-0">
                        <QrCode className="mr-1.5 h-4 w-4" /> Jana
                    </Button>
                </div>
            )}

            {/* QR Output */}
            {qrDataUrl && (
                <div className="glass-card glass-shimmer rounded-2xl p-6 flex flex-col items-center gap-4">
                    <img
                        src={qrDataUrl}
                        alt="QR Code"
                        className="w-48 h-48 rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground text-center break-all max-w-[300px]">
                        {generateUrl()}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={downloadQR} className="glass-button rounded-xl text-xs">
                            <Download className="mr-1 h-3 w-3" /> Muat Turun
                        </Button>
                        <Button variant="outline" size="sm" onClick={copyUrl} className="glass-button rounded-xl text-xs">
                            {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                            {copied ? 'Disalin' : 'Salin URL'}
                        </Button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            )}
        </div>
    );
}
