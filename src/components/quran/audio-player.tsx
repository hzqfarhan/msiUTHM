/**
 * Quran audio player UI components.
 */
'use client';

import { Play, Pause, Loader2, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Full surah play/pause button ── */
export function SurahAudioButton({
    audioUrl,
    playing,
    loading,
    onPlay,
    onStop,
    label = 'Main Audio',
    className,
}: {
    audioUrl: string;
    playing: boolean;
    loading: boolean;
    onPlay: (url: string) => void;
    onStop: () => void;
    label?: string;
    className?: string;
}) {
    return (
        <button
            onClick={() => (playing ? onStop() : onPlay(audioUrl))}
            disabled={loading}
            aria-label={playing ? 'Pause audio' : 'Main audio surah'}
            className={cn(
                'glass-button rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-medium transition-all',
                playing && 'glow-emerald text-navy dark:text-primary',
                className,
            )}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : playing ? (
                <Pause className="h-4 w-4" />
            ) : (
                <Play className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}

/* ── Per-ayah play button (compact) ── */
export function AyahAudioButton({
    audioUrl,
    isPlaying,
    isLoading,
    onPlay,
    className,
}: {
    audioUrl: string;
    isPlaying: boolean;
    isLoading: boolean;
    onPlay: (url: string) => void;
    className?: string;
}) {
    return (
        <button
            onClick={() => onPlay(audioUrl)}
            aria-label={isPlaying ? 'Pause ayat' : 'Main audio ayat'}
            className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center transition-all',
                isPlaying
                    ? 'glass-button glow-emerald text-navy dark:text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/10',
                className,
            )}
        >
            {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isPlaying ? (
                <VolumeX className="h-3.5 w-3.5" />
            ) : (
                <Volume2 className="h-3.5 w-3.5" />
            )}
        </button>
    );
}
