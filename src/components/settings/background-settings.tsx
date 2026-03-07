/**
 * BackgroundSettings — file picker to set a custom background image.
 * Stores as base64 data URL in localStorage.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageIcon, Trash2, Upload } from 'lucide-react';

export function BackgroundSettings({ onClose }: { onClose?: () => void }) {
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem('custom-bg-image');
        if (stored) setPreview(stored);
    }, []);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limit to 2MB
        if (file.size > 2 * 1024 * 1024) {
            alert('Saiz gambar mesti kurang dari 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            localStorage.setItem('custom-bg-image', dataUrl);
            setPreview(dataUrl);
            window.dispatchEvent(new Event('bg-updated'));
        };
        reader.readAsDataURL(file);
    };

    const handleRemove = () => {
        localStorage.removeItem('custom-bg-image');
        setPreview(null);
        window.dispatchEvent(new Event('bg-updated'));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-emerald-500" />
                    Latar Belakang
                </h3>
                {onClose && (
                    <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
                        Tutup
                    </button>
                )}
            </div>

            {preview ? (
                <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-[var(--glass-border)] aspect-video">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt="Background preview" className="w-full h-full object-cover" />
                    </div>
                    <button
                        onClick={handleRemove}
                        className="liquid-btn liquid-btn-rose text-xs w-full"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Buang Latar Belakang
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => inputRef.current?.click()}
                    className="liquid-btn liquid-btn-emerald text-xs w-full"
                >
                    <Upload className="h-3.5 w-3.5" />
                    Pilih Gambar
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
            />

            <p className="text-[10px] text-muted-foreground">
                Pilih gambar (maks 2MB) untuk dijadikan latar belakang aplikasi.
            </p>
        </div>
    );
}
