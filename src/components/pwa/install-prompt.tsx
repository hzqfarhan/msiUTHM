/**
 * PWA Install Prompt — triggers "Add to Home Screen" after 2nd visit.
 */
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { trackInstallPrompt } from '@/services/analytics';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Track visit count
        const visits = parseInt(localStorage.getItem('msi_visit_count') || '0') + 1;
        localStorage.setItem('msi_visit_count', String(visits));

        const dismissed = localStorage.getItem('msi_install_dismissed');
        if (dismissed) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            if (visits >= 2) {
                setShow(true);
                trackInstallPrompt('shown');
            }
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        trackInstallPrompt(outcome);
        setShow(false);
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShow(false);
        localStorage.setItem('msi_install_dismissed', 'true');
        trackInstallPrompt('dismissed');
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-lg dark:border-emerald-800 dark:bg-emerald-950/90">
                <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-emerald-600 p-2 text-white">
                        <Download className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm text-emerald-900 dark:text-emerald-100">
                            Pasang MSI UTHM
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                            Akses pantas waktu solat & program di skrin utama anda.
                        </p>
                        <div className="mt-3 flex gap-2">
                            <Button size="sm" onClick={handleInstall} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8">
                                Pasang
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleDismiss} className="text-xs h-8">
                                Nanti
                            </Button>
                        </div>
                    </div>
                    <button onClick={handleDismiss} className="text-emerald-400 hover:text-emerald-600">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
