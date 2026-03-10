'use client';

import { useGlobalAudio } from './audio-context';
import { Play, Pause, X, Loader2, Repeat, Repeat1 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MALAY_SURAH_NAMES } from '@/services/quran';

export function GlobalAudioPlayer() {
    const { state, stop, togglePause, toggleRepeat } = useGlobalAudio();

    if (!state.track && !state.loading && !state.playing) {
        return null;
    }

    const surahName = state.track ? MALAY_SURAH_NAMES[state.track.surahNumber] || `Surah ${state.track.surahNumber}` : '';
    const label = state.track?.label || (state.track?.ayahNumber ? `Ayat ${state.track.ayahNumber}` : 'Sepenuh Surah');

    return (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full px-4 max-w-sm sm:max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="glass-card glass-heavy border-[var(--glass-border)] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.3)] rounded-2xl p-3 flex items-center gap-3 relative overflow-hidden">

                {/* Visual playing indicator (glow) */}
                {state.playing && (
                    <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                )}

                {/* Track Info */}
                <div className="flex-1 min-w-0 pl-1">
                    <p className="text-sm font-bold truncate text-foreground/90 leading-tight">
                        {surahName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                        {label}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 shrink-0">
                    {/* Repeat Toggle */}
                    <button
                        onClick={toggleRepeat}
                        className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                            state.repeat
                                ? "text-primary bg-primary/10"
                                : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                        )}
                        aria-label="Ulang / Repeat"
                    >
                        {state.repeat ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
                    </button>

                    {/* Play/Pause */}
                    <button
                        onClick={togglePause}
                        disabled={state.loading}
                        className="h-10 w-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-50"
                        aria-label={state.playing ? "Pause" : "Play"}
                    >
                        {state.loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : state.playing ? (
                            <Pause className="h-5 w-5 fill-current" />
                        ) : (
                            <Play className="h-5 w-5 ml-0.5 fill-current" />
                        )}
                    </button>

                    {/* Stop / Close */}
                    <button
                        onClick={stop}
                        className="h-8 w-8 ml-1 rounded-full flex items-center justify-center text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        aria-label="Tutup"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
