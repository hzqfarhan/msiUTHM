/**
 * Surah reader — ayah-by-ayah display with Arabic, English, Malay and audio.
 * Fetches all three editions in parallel.
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, BookOpen, RefreshCw, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    getSurahArabic, getSurahEnglish, getSurahMalay, getSurahAudio,
    getFullSurahAudioUrl, getAyahAudioUrl, MALAY_SURAH_NAMES,
    type SurahEdition, type Ayah,
} from '@/services/quran';
import { SurahAudioButton, AyahAudioButton } from './audio-player';
import { useGlobalAudio } from './audio-context';
import { useBookmarks } from '@/lib/hooks/use-bookmarks';
import { Bookmark } from 'lucide-react';

interface SurahReaderProps {
    surahNumber: number;
}

interface MergedAyah {
    numberInSurah: number;
    globalNumber: number;
    arabic: string;
    english: string;
    malay: string;
    audioUrl: string;
}

export function SurahReader({ surahNumber }: SurahReaderProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [surahInfo, setSurahInfo] = useState<SurahEdition | null>(null);
    const [ayahs, setAyahs] = useState<MergedAyah[]>([]);
    const audio = useGlobalAudio();
    const { toggleBookmark, isBookmarked } = useBookmarks();

    const fetchSurah = useCallback(async () => {
        setLoading(true);
        setError(null);

        const [arabicRes, englishRes, malayRes, audioRes] = await Promise.all([
            getSurahArabic(surahNumber),
            getSurahEnglish(surahNumber),
            getSurahMalay(surahNumber),
            getSurahAudio(surahNumber),
        ]);

        if (!arabicRes.ok || !arabicRes.data) {
            setError(arabicRes.error || 'Gagal memuatkan surah');
            setLoading(false);
            return;
        }

        const arabicData = arabicRes.data;
        const englishAyahs = englishRes.data?.ayahs || [];
        const malayAyahs = malayRes.data?.ayahs || [];
        const audioAyahs = audioRes.data?.ayahs || [];

        setSurahInfo(arabicData);

        const merged: MergedAyah[] = arabicData.ayahs.map((a, i) => {
            let arabicText = a.text;
            // The API includes Bismillah in the first ayah except for Surah 1 & 9
            const bismillahStr = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ';
            const bismillahStrAlternate = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'; // without trailing space
            if (a.numberInSurah === 1 && surahNumber !== 1 && surahNumber !== 9) {
                if (arabicText.startsWith(bismillahStr)) {
                    arabicText = arabicText.replace(bismillahStr, '').trim();
                } else if (arabicText.startsWith(bismillahStrAlternate)) {
                    arabicText = arabicText.replace(bismillahStrAlternate, '').trim();
                }
            }
            return {
                numberInSurah: a.numberInSurah,
                globalNumber: a.number,
                arabic: arabicText,
                english: englishAyahs[i]?.text || '',
                malay: malayAyahs[i]?.text || '',
                audioUrl: audioAyahs[i]?.audio || getAyahAudioUrl(a.number),
            };
        });

        setAyahs(merged);
        setLoading(false);
    }, [surahNumber]);

    useEffect(() => {
        fetchSurah();
    }, [fetchSurah]);

    /* ── Loading skeleton ── */
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl glass-card animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-5 w-48 rounded glass-card animate-pulse" />
                        <div className="h-3 w-32 rounded glass-card animate-pulse" />
                    </div>
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="glass-card rounded-xl p-6 space-y-3 animate-pulse">
                        <div className="h-6 w-full rounded" />
                        <div className="h-4 w-3/4 rounded bg-muted/30" />
                        <div className="h-4 w-2/3 rounded bg-muted/30" />
                    </div>
                ))}
            </div>
        );
    }

    /* ── Error state ── */
    if (error) {
        return (
            <div className="space-y-4">
                <Link
                    href="/quran"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <div className="glass-card rounded-xl p-8 text-center space-y-4">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <button
                        onClick={fetchSurah}
                        className="liquid-btn liquid-btn-emerald text-sm mx-auto"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Cuba Semula
                    </button>
                </div>
            </div>
        );
    }

    if (!surahInfo) return null;

    const fullAudioUrl = getFullSurahAudioUrl(surahNumber);

    return (
        <div className="space-y-4">
            {/* Back + header */}
            <Link
                href="/quran"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Senarai Surah
            </Link>

            {/* Surah header */}
            <div className="glass-card glass-shimmer rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold">
                            {surahInfo.englishName}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {surahInfo.englishNameTranslation}
                            {MALAY_SURAH_NAMES[surahNumber] && (
                                <span> · {MALAY_SURAH_NAMES[surahNumber]}</span>
                            )}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-2xl font-bold text-primary" dir="rtl">{surahInfo.name}</p>
                        <div className="flex items-center gap-2 justify-end mt-1">
                            <span className="glass-badge">{surahInfo.numberOfAyahs} ayat</span>
                            <span className={cn(
                                'glass-badge',
                                surahInfo.revelationType === 'Meccan'
                                    ? 'text-amber-500 dark:text-amber-400'
                                    : 'text-blue-500 dark:text-blue-400',
                            )}>
                                {surahInfo.revelationType === 'Meccan' ? 'Makkiyyah' : 'Madaniyyah'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Audio controls */}
                <div className="flex items-center gap-3 pt-1">
                    <SurahAudioButton
                        audioUrl={fullAudioUrl}
                        playing={audio.state.track?.url === fullAudioUrl && audio.state.playing}
                        loading={audio.state.track?.url === fullAudioUrl && audio.state.loading}
                        onPlay={(url) => audio.play(url, surahNumber, undefined, 'Sepenuh Surah')}
                        onStop={audio.stop}
                        label="Main Surah"
                    />
                    {audio.state.error && (
                        <p className="text-xs text-destructive">{audio.state.error}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground ml-auto">
                        Qari: Mishary Rashid Alafasy
                    </p>
                </div>
            </div>

            {/* Bismillah (except for Surah 1 Al-Fatihah and Surah 9 At-Taubah) */}
            {surahNumber !== 1 && surahNumber !== 9 && (
                <div className="text-center py-4">
                    <p className="text-2xl font-bold text-primary" dir="rtl" style={{ fontFamily: '"Amiri", "Traditional Arabic", serif' }}>
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani
                    </p>
                </div>
            )}

            {/* Ayah list */}
            <div className="space-y-3">
                {ayahs.map(ayah => {
                    const isPlayingThis = audio.state.track?.url === ayah.audioUrl && audio.state.playing;
                    const isLoadingThis = audio.state.track?.url === ayah.audioUrl && audio.state.loading;

                    return (
                        <article
                            key={ayah.numberInSurah}
                            className={cn(
                                'glass-card rounded-xl p-4 sm:p-5 space-y-3 transition-all',
                                isPlayingThis && 'border-primary/30 shadow-[0_0_20px_var(--glass-glow-emerald)]',
                            )}
                        >
                            {/* Ayah header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center h-7 w-7 rounded-md bg-primary/10 text-navy dark:text-primary text-xs font-bold">
                                        {ayah.numberInSurah}
                                    </span>
                                    <button
                                        onClick={() => toggleBookmark(surahNumber, ayah.numberInSurah)}
                                        className={cn(
                                            "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                                            isBookmarked(surahNumber, ayah.numberInSurah)
                                                ? "text-navy dark:text-primary bg-primary/10"
                                                : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                                        )}
                                        aria-label={isBookmarked(surahNumber, ayah.numberInSurah) ? "Buang Penanda Buku" : "Tambah Penanda Buku"}
                                    >
                                        <Bookmark className={cn("h-4 w-4", isBookmarked(surahNumber, ayah.numberInSurah) && "fill-current")} />
                                    </button>
                                    <AyahAudioButton
                                        audioUrl={ayah.audioUrl}
                                        isPlaying={isPlayingThis}
                                        isLoading={isLoadingThis}
                                        onPlay={(url) => audio.play(url, surahNumber, ayah.numberInSurah, `Ayat ${ayah.numberInSurah}`)}
                                    />
                                </div>
                            </div>

                            {/* Arabic text */}
                            <p
                                className="text-xl sm:text-2xl leading-loose text-right"
                                dir="rtl"
                                lang="ar"
                                style={{ fontFamily: '"Amiri", "Traditional Arabic", serif' }}
                            >
                                {ayah.arabic}
                            </p>

                            {/* English translation */}
                            {ayah.english && (
                                <div className="border-t border-[var(--glass-border-subtle)] pt-3">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1">
                                        English
                                    </p>
                                    <p className="text-sm text-foreground/80 leading-relaxed">
                                        {ayah.english}
                                    </p>
                                </div>
                            )}

                            {/* Malay translation */}
                            {ayah.malay && (
                                <div className="border-t border-[var(--glass-border-subtle)] pt-3">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1">
                                        Bahasa Melayu
                                    </p>
                                    <p className="text-sm text-foreground/80 leading-relaxed">
                                        {ayah.malay}
                                    </p>
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>

            {/* Bottom navigation */}
            <div className="flex items-center justify-between pt-4">
                {surahNumber > 1 ? (
                    <Link
                        href={`/quran/${surahNumber - 1}`}
                        className="liquid-btn liquid-btn-teal text-xs"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Surah Sebelum
                    </Link>
                ) : <div />}
                {surahNumber < 114 ? (
                    <Link
                        href={`/quran/${surahNumber + 1}`}
                        className="liquid-btn liquid-btn-emerald text-xs"
                    >
                        Surah Seterusnya
                        <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                    </Link>
                ) : <div />}
            </div>
        </div>
    );
}
