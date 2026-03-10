'use client';

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface TrackInfo {
    surahNumber: number;
    ayahNumber: number | null;
    url: string;
    label?: string;
}

interface AudioState {
    track: TrackInfo | null;
    playing: boolean;
    loading: boolean;
    error: string | null;
    repeat: boolean;
}

interface QuranAudioContextType {
    state: AudioState;
    play: (url: string, surahNumber: number, ayahNumber?: number, label?: string) => void;
    stop: () => void;
    togglePause: () => void;
    toggleRepeat: () => void;
}

const QuranAudioContext = createContext<QuranAudioContextType | undefined>(undefined);

export function QuranAudioProvider({ children }: { children: React.ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const profile = useProfile();
    const router = useRouter();
    const pathname = usePathname();

    const [state, setState] = useState<AudioState>({
        track: null,
        playing: false,
        loading: false,
        error: null,
        repeat: false,
    });

    // Ensure audio element exists
    const getAudio = useCallback(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.preload = 'none';
        }
        return audioRef.current;
    }, []);

    const play = useCallback(
        (url: string, surahNumber: number, ayahNumber?: number, label?: string) => {
            // Check auth first
            if (!profile) {
                toast.error('Sila log masuk untuk memainkan bacaan Al-Quran.');
                router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
                return;
            }

            const audio = getAudio();

            // If same URL is currently playing, just return (handled by togglePause usually)
            if (state.track?.url === url && state.playing) {
                return;
            }

            // If same URL is paused, resume
            if (state.track?.url === url && !state.playing && !state.loading) {
                audio.play().catch(() => { });
                setState((s) => ({ ...s, playing: true, error: null }));
                return;
            }

            // New URL — stop previous, start loading
            audio.pause();
            audio.src = url;
            setState((s) => ({
                ...s,
                track: { surahNumber, ayahNumber: ayahNumber ?? null, url, label },
                playing: false,
                loading: true,
                error: null,
            }));

            const onCanPlay = () => {
                audio.play().then(() => {
                    setState((s) => ({ ...s, playing: true, loading: false }));
                }).catch((err) => {
                    setState((s) => ({ ...s, loading: false, error: err.message }));
                });
            };

            const onEnded = () => {
                // Determine if we should repeat
                setState((s) => {
                    if (s.repeat) {
                        audio.currentTime = 0;
                        audio.play().catch(() => { });
                        return { ...s, playing: true };
                    }
                    return { ...s, playing: false };
                });
            };

            const onError = () => {
                setState((s) => ({
                    ...s,
                    loading: false,
                    playing: false,
                    error: 'Gagal memuatkan audio',
                }));
            };

            // Clean previous listeners
            audio.removeEventListener('canplaythrough', onCanPlay);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);

            audio.addEventListener('canplaythrough', onCanPlay, { once: true });
            audio.addEventListener('ended', onEnded);
            audio.addEventListener('error', onError, { once: true });

            audio.load();
        },
        [getAudio, state.track, state.playing, state.loading, profile, router, pathname]
    );

    const stop = useCallback(() => {
        const audio = getAudio();
        audio.pause();
        audio.src = '';
        setState((s) => ({ ...s, track: null, playing: false, loading: false, error: null }));
    }, [getAudio]);

    const togglePause = useCallback(() => {
        const audio = getAudio();
        if (state.playing) {
            audio.pause();
            setState((s) => ({ ...s, playing: false }));
        } else if (state.track?.url) {
            audio.play().catch(() => { });
            setState((s) => ({ ...s, playing: true }));
        }
    }, [getAudio, state.playing, state.track]);

    const toggleRepeat = useCallback(() => {
        setState((s) => ({ ...s, repeat: !s.repeat }));
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        };
    }, []);

    return (
        <QuranAudioContext.Provider value={{ state, play, stop, togglePause, toggleRepeat }}>
            {children}
        </QuranAudioContext.Provider>
    );
}

export function useGlobalAudio() {
    const context = useContext(QuranAudioContext);
    if (context === undefined) {
        throw new Error('useGlobalAudio must be used within a QuranAudioProvider');
    }
    return context;
}
