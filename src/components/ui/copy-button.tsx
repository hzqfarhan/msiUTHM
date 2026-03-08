/**
 * CopyButton — copies text to clipboard with feedback.
 */
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CopyButton({ text, label }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all',
                copied
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                    : 'glass-button text-muted-foreground hover:text-foreground',
            )}
            title={`Salin ${label || text}`}
        >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Disalin!' : (label || 'Salin')}
        </button>
    );
}
