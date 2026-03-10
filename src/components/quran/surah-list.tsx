/**
 * Surah list — client component with search, filter, and responsive grid.
 * Uses glass-card styling from the existing design system.
 */
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, BookOpen, RefreshCw, Filter, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSurahList, MALAY_SURAH_NAMES, MALAY_SURAH_MEANINGS, JUZ_METADATA, SURAH_REVELATION_ORDER, type SurahMeta } from '@/services/quran';
import { useBookmarks } from '@/lib/hooks/use-bookmarks';

type RevelationFilter = 'all' | 'Meccan' | 'Medinan';

export function SurahList() {
    const [surahs, setSurahs] = useState<SurahMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [revelationFilter, setRevelationFilter] = useState<RevelationFilter>('all');

    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [activeTab, setActiveTab] = useState('surah');
    const { bookmarks } = useBookmarks();

    const fetchSurahs = async () => {
        setLoading(true);
        setError(null);
        const result = await getSurahList();
        if (result.ok && result.data) {
            setSurahs(result.data);
        } else {
            setError(result.error || 'Gagal memuatkan senarai surah');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSurahs();
    }, []);

    const filtered = useMemo(() => {
        let list = [...surahs];
        if (revelationFilter !== 'all') {
            list = list.filter(s => s.revelationType === revelationFilter);
        }
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(s =>
                s.number.toString().includes(q) ||
                s.englishName.toLowerCase().includes(q) ||
                s.englishNameTranslation.toLowerCase().includes(q) ||
                s.name.includes(q) ||
                (MALAY_SURAH_NAMES[s.number]?.toLowerCase().includes(q))
            );
        }

        // Sorting
        if (activeTab === 'wahyu') {
            list.sort((a, b) => {
                const orderA = SURAH_REVELATION_ORDER[a.number] || a.number;
                const orderB = SURAH_REVELATION_ORDER[b.number] || b.number;
                return sortOrder === 'asc' ? orderA - orderB : orderB - orderA;
            });
        } else {
            // surah tab sorting by standard id
            list.sort((a, b) => {
                return sortOrder === 'asc' ? a.number - b.number : b.number - a.number;
            });
        }

        return list;
    }, [surahs, search, revelationFilter, sortOrder, activeTab]);

    /* ── Loading skeleton ── */
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-11 rounded-xl glass-card animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-24 rounded-xl glass-card animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    /* ── Error state ── */
    if (error) {
        return (
            <div className="glass-card rounded-xl p-8 text-center space-y-4">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                    onClick={fetchSurahs}
                    className="liquid-btn liquid-btn-emerald text-sm mx-auto"
                >
                    <RefreshCw className="h-4 w-4" />
                    Cuba Semula
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top Tabs & Sort matching reference */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[var(--glass-border-subtle)] pb-2 overflow-x-auto hide-scrollbar">
                    <div className="flex items-center gap-6">
                        <button
                            className={cn("text-sm font-medium pb-2 border-b-2 transition-colors whitespace-nowrap", activeTab === 'surah' ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
                            onClick={() => setActiveTab('surah')}
                        >
                            Surah
                        </button>
                        <button
                            className={cn("text-sm font-medium pb-2 border-b-2 transition-colors whitespace-nowrap", activeTab === 'juz' ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
                            onClick={() => setActiveTab('juz')}
                        >
                            Juz
                        </button>
                        <button
                            className={cn("text-sm font-medium pb-2 border-b-2 transition-colors whitespace-nowrap", activeTab === 'wahyu' ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
                            onClick={() => setActiveTab('wahyu')}
                        >
                            Urutan Penurunan Wahyu
                        </button>
                        <button
                            className={cn("text-sm font-medium pb-2 border-b-2 transition-colors whitespace-nowrap", activeTab === 'bookmarks' ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
                            onClick={() => setActiveTab('bookmarks')}
                        >
                            Penanda Buku
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={activeTab === 'juz' ? "Cari juz..." : "Cari surah..."}
                            aria-label={activeTab === 'juz' ? "Cari juz" : "Cari surah"}
                            className="w-full glass-input rounded-xl py-2 pl-9 pr-4 text-sm placeholder:text-muted-foreground/50"
                        />
                    </div>

                    {activeTab === 'surah' && (
                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 shrink-0"
                        >
                            DISUSUN MENGIKUT: {sortOrder === 'asc' ? 'MENAIK' : 'MENURUN'}
                            <span className="text-[8px] opacity-70 ml-0.5">▼</span>
                        </button>
                    )}
                </div>
            </div>

            {/* No results */}
            {((activeTab === 'surah' || activeTab === 'wahyu') && filtered.length === 0) && (
                <div className="glass-card rounded-xl p-8 text-center">
                    <p className="text-sm text-muted-foreground">Tiada carian ditemui.</p>
                </div>
            )}
            {(activeTab === 'juz' && JUZ_METADATA.filter(j => j.name.toLowerCase().includes(search.toLowerCase()) || j.id.toString().includes(search)).length === 0) && (
                <div className="glass-card rounded-xl p-8 text-center">
                    <p className="text-sm text-muted-foreground">Tiada carian ditemui.</p>
                </div>
            )}

            {/* Grid display for Surah / Wahyu vs Juz vs Bookmarks */}
            {activeTab === 'bookmarks' ? (
                bookmarks.length === 0 ? (
                    <div className="glass-card rounded-xl p-8 text-center">
                        <Bookmark className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">Tiada penanda buku disimpan.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {bookmarks.map(b => (
                            <Link
                                key={b.id}
                                href={`/quran/${b.surahNumber}#ayah-${b.ayahNumber}`}
                                className="glass-card glass-shimmer rounded-xl p-4 flex items-center justify-between group cursor-pointer transition-all hover:bg-white/5 dark:hover:bg-white/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
                                        <div className="absolute inset-0 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors" />
                                        <Bookmark className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                            {b.surahName}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Ayat {b.ayahNumber}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-muted-foreground">
                                        {new Date(b.timestamp).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )
            ) : activeTab === 'juz' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {JUZ_METADATA.filter(j => j.name.toLowerCase().includes(search.toLowerCase()) || j.id.toString().includes(search)).map(juz => (
                        <Link
                            key={juz.id}
                            href={`/quran/juz/${juz.id}`}
                            className="glass-card glass-shimmer rounded-xl p-4 flex flex-col justify-center gap-2 group cursor-pointer transition-all hover:bg-white/5 dark:hover:bg-white/5"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex items-center justify-center w-[38px] h-[38px] shrink-0">
                                        <div className="absolute inset-0 rotate-45 border-[1.5px] border-primary/30 rounded-sm group-hover:border-primary/60 transition-colors" />
                                        <span className="relative text-xs font-bold text-primary">{juz.id}</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">Juz {juz.id}</div>
                                        <div className="text-xs text-muted-foreground line-clamp-1">{juz.startingSurah}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-primary mb-1" dir="rtl" style={{ fontFamily: '"Amiri", "Traditional Arabic", serif' }}>
                                        الجزء {juz.id.toLocaleString('ar-EG')}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filtered.map(surah => (
                        <Link
                            key={surah.number}
                            href={`/quran/${surah.number}`}
                            className="glass-card glass-shimmer rounded-xl p-4 flex flex-row items-center gap-5 group cursor-pointer transition-all hover:bg-white/5 dark:hover:bg-white/5"
                        >
                            {/* Diamond Number Shape (Reference match) */}
                            <div className="relative flex items-center justify-center w-9 h-9 shrink-0 ml-1">
                                {/* Rotated diamond background */}
                                <div className="absolute inset-0 bg-white/5 border border-[var(--glass-border-subtle)] rotate-45 group-hover:bg-primary/20 group-hover:border-primary/50 transition-all duration-300 shadow-sm"></div>
                                {/* Unrotated text */}
                                <span className="relative z-10 font-bold text-[13px] text-foreground group-hover:text-primary transition-colors">
                                    {surah.number}
                                </span>
                            </div>

                            {/* Surah Info Layout */}
                            <div className="flex flex-1 items-center justify-between min-w-0">
                                {/* Left: Malay Name & Translation */}
                                <div className="flex flex-col min-w-0 pr-2">
                                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                                        {MALAY_SURAH_NAMES[surah.number] || surah.englishName}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground truncate mt-0.5" title={MALAY_SURAH_MEANINGS[surah.number] || surah.englishNameTranslation}>
                                        {MALAY_SURAH_MEANINGS[surah.number] || surah.englishNameTranslation}
                                    </p>
                                </div>

                                {/* Right: Arabic & Ayah Count */}
                                <div className="flex flex-col items-end shrink-0 text-right">
                                    <p className="text-[15px] font-bold text-foreground/90 group-hover:text-primary transition-colors" dir="rtl" style={{ fontFamily: '"Amiri", "Traditional Arabic", serif' }}>
                                        {surah.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {surah.numberOfAyahs} Ayat-ayat
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
