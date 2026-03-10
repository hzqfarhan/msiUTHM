'use client';

import { useState, useCallback, useEffect } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { MALAY_SURAH_NAMES } from '@/services/quran';

export interface Bookmark {
    id: string; // surahNumber-ayahNumber
    surahNumber: number;
    ayahNumber: number;
    surahName: string;
    timestamp: number;
}

export function useBookmarks() {
    const profile = useProfile();
    const router = useRouter();
    const pathname = usePathname();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

    const getStorageKey = useCallback(() => {
        if (!profile?.id) return null;
        return `msi-quran-bookmarks-${profile.id}`;
    }, [profile]);

    // Load bookmarks on mount or profile change
    useEffect(() => {
        const key = getStorageKey();
        if (key) {
            try {
                const stored = localStorage.getItem(key);
                if (stored) {
                    setBookmarks(JSON.parse(stored));
                } else {
                    setBookmarks([]);
                }
            } catch (err) {
                console.error("Failed to load bookmarks", err);
            }
        } else {
            setBookmarks([]);
        }
    }, [getStorageKey]);

    const saveBookmarks = (newBookmarks: Bookmark[]) => {
        const key = getStorageKey();
        if (key) {
            localStorage.setItem(key, JSON.stringify(newBookmarks));
            setBookmarks(newBookmarks);
        }
    };

    const toggleBookmark = useCallback((surahNumber: number, ayahNumber: number) => {
        if (!profile) {
            toast.error('Sila log masuk untuk menyimpan penanda buku.');
            router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }

        const id = `${surahNumber}-${ayahNumber}`;
        const exists = bookmarks.some(b => b.id === id);

        if (exists) {
            const updated = bookmarks.filter(b => b.id !== id);
            saveBookmarks(updated);
            toast.success('Penanda buku telah dibuang.');
        } else {
            const surahName = MALAY_SURAH_NAMES[surahNumber] || `Surah ${surahNumber}`;
            const newBookmark: Bookmark = {
                id,
                surahNumber,
                ayahNumber,
                surahName,
                timestamp: Date.now()
            };
            const updated = [...bookmarks, newBookmark].sort((a, b) => b.timestamp - a.timestamp);
            saveBookmarks(updated);
            toast.success('Penanda buku telah disimpan.');
        }
    }, [profile, bookmarks, router, pathname]);

    const isBookmarked = useCallback((surahNumber: number, ayahNumber: number) => {
        const id = `${surahNumber}-${ayahNumber}`;
        return bookmarks.some(b => b.id === id);
    }, [bookmarks]);

    return { bookmarks, toggleBookmark, isBookmarked };
}
