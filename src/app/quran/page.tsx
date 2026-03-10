/**
 * Al-Quran page — surah list with search and filtering.
 */
import { SurahList } from '@/components/quran/surah-list';
import { PageViewTracker } from '@/components/page-view-tracker';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Al-Quran',
    description: 'Baca Al-Quran dengan terjemahan Bahasa Melayu dan Bahasa Inggeris',
};

export default function QuranPage() {
    return (
        <div className="space-y-4">
            <PageViewTracker />
            <div>
                <h1 className="text-xl font-bold">Al-Quran</h1>
                <p className="text-sm text-muted-foreground">
                    Baca Al-Quran dengan terjemahan dan audio
                </p>
            </div>
            <SurahList />
        </div>
    );
}
