'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, BookOpen, RefreshCw, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    getJuzArabic, getJuzEnglish, getJuzMalay,
    getAyahAudioUrl, JUZ_METADATA, MALAY_SURAH_NAMES,
    type JuzEdition, type Ayah, type SurahMeta
} from '@/services/quran';
import { AyahAudioButton } from './audio-player';
import { useGlobalAudio } from './audio-context';
import { useBookmarks } from '@/lib/hooks/use-bookmarks';
import { Bookmark } from 'lucide-react';

interface JuzReaderProps {
    juzNumber: number;
}

interface MergedAyah {
    numberInSurah: number;
    globalNumber: number;
    arabic: string;
    english: string;
    malay: string;
    audioUrl: string;
    surah?: SurahMeta;
}

export function JuzReader({ juzNumber }: JuzReaderProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [juzInfo, setJuzInfo] = useState<JuzEdition | null>(null);
    const [ayahs, setAyahs] = useState<MergedAyah[]>([]);
    const audio = useGlobalAudio();
    const { toggleBookmark, isBookmarked } = useBookmarks();

    const fetchJuz = useCallback(async () => {
        setLoading(true);
        setError(null);

        const [arabicRes, englishRes, malayRes] = await Promise.all([
            getJuzArabic(juzNumber),
            getJuzEnglish(juzNumber),
            getJuzMalay(juzNumber),
        ]);

        if (!arabicRes.ok || !arabicRes.data) {
            setError(arabicRes.error || 'Gagal memuatkan Juz');
            setLoading(false);
            return;
        }

        const arabicData = arabicRes.data;
        const englishAyahs = englishRes.data?.ayahs || [];
        const malayAyahs = malayRes.data?.ayahs || [];

        setJuzInfo(arabicData);

        const merged: MergedAyah[] = arabicData.ayahs.map((a, i) => ({
            numberInSurah: a.numberInSurah,
            globalNumber: a.number,
            arabic: a.text,
            english: englishAyahs[i]?.text || '',
            malay: malayAyahs[i]?.text || '',
            audioUrl: getAyahAudioUrl(a.number),
            surah: a.surah,
        }));

        setAyahs(merged);
        setLoading(false);
    }, [juzNumber]);

    useEffect(() => {
        fetchJuz();
    }, [fetchJuz]);

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
                        onClick={fetchJuz}
                        className="liquid-btn liquid-btn-emerald text-sm mx-auto"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Cuba Semula
                    </button>
                </div>
            </div>
        );
    }

    if (!juzInfo) return null;

    const juzMeta = JUZ_METADATA.find(j => j.id === juzNumber);

    return (
        <div className="space-y-4">
            {/* Back + header */}
            <Link
                href="/quran"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => {
                    // Quick state cleanup for audio might be nice, but handled by unmount usually
                }}
            >
                <ArrowLeft className="h-4 w-4" /> Senarai Juz
            </Link>

            {/* Juz header */}
            <div className="glass-card glass-shimmer rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold">
                            {juzMeta?.name || `Juz ${juzNumber}`}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Bermula: {juzMeta?.startingSurah}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-2xl font-bold text-primary" dir="rtl">
                            الجزء {juzNumber.toLocaleString('ar-EG')}
                        </p>
                        <div className="flex items-center gap-2 justify-end mt-1">
                            <span className="glass-badge">{ayahs.length} ayat</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ayah list */}
            <div className="space-y-3">
                {ayahs.map((ayah, index) => {
                    const isPlayingThis = audio.state.track?.url === ayah.audioUrl && audio.state.playing;
                    const isLoadingThis = audio.state.track?.url === ayah.audioUrl && audio.state.loading;

                    // Check if this ayah starts a new surah in the juz
                    const prevAyah = index > 0 ? ayahs[index - 1] : null;
                    const isNewSurah = index === 0 || (ayah.surah && prevAyah?.surah && ayah.surah.number !== prevAyah.surah.number);

                    return (
                        <div key={ayah.globalNumber} className="space-y-3">
                            {isNewSurah && ayah.surah && (
                                <div className="py-6 text-center">
                                    <div className="inline-flex items-center justify-center space-x-2 glass-card px-4 py-2 rounded-full">
                                        <BookOpen className="w-4 h-4 text-emerald-500" />
                                        <span className="font-semibold text-sm">
                                            {ayah.surah.englishName} ({MALAY_SURAH_NAMES[ayah.surah.number] || ayah.surah.englishNameTranslation})
                                        </span>
                                    </div>
                                    {ayah.surah.number !== 1 && ayah.surah.number !== 9 && ayah.numberInSurah === 1 && (
                                        <div className="mt-4">
                                            <p className="text-2xl font-bold text-primary" dir="rtl" style={{ fontFamily: '"Amiri", "Traditional Arabic", serif' }}>
                                                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <article
                                className={cn(
                                    'glass-card rounded-xl p-4 sm:p-5 space-y-3 transition-all',
                                    isPlayingThis && 'border-primary/30 shadow-[0_0_20px_var(--glass-glow-emerald)]',
                                )}
                            >
                                {/* Ayah header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center justify-center h-7 w-7 rounded-md bg-primary/10 text-primary text-xs font-bold">
                                            {ayah.numberInSurah}
                                        </span>
                                        <button
                                            onClick={() => toggleBookmark(ayah.surah?.number || 1, ayah.numberInSurah)}
                                            className={cn(
                                                "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                                                isBookmarked(ayah.surah?.number || 1, ayah.numberInSurah)
                                                    ? "text-primary bg-primary/10"
                                                    : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                                            )}
                                            aria-label={isBookmarked(ayah.surah?.number || 1, ayah.numberInSurah) ? "Buang Penanda Buku" : "Tambah Penanda Buku"}
                                        >
                                            <Bookmark className={cn("h-4 w-4", isBookmarked(ayah.surah?.number || 1, ayah.numberInSurah) && "fill-current")} />
                                        </button>
                                        <AyahAudioButton
                                            audioUrl={ayah.audioUrl}
                                            isPlaying={isPlayingThis}
                                            isLoading={isLoadingThis}
                                            onPlay={(url) => audio.play(url, ayah.surah?.number || 1, ayah.numberInSurah, `Ayat ${ayah.numberInSurah}`)}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Surah {ayah.surah?.number || ''}
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
                        </div>
                    );
                })}
            </div>

            {/* Bottom navigation */}
            <div className="flex items-center justify-between pt-4">
                {juzNumber > 1 ? (
                    <Link
                        href={`/quran/juz/${juzNumber - 1}`}
                        className="liquid-btn liquid-btn-teal text-xs"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Juz Sebelum
                    </Link>
                ) : <div />}
                {juzNumber < 30 ? (
                    <Link
                        href={`/quran/juz/${juzNumber + 1}`}
                        className="liquid-btn liquid-btn-emerald text-xs"
                    >
                        Juz Seterusnya
                        <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                    </Link>
                ) : <div />}
            </div>
        </div>
    );
}
