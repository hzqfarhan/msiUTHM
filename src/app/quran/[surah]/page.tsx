/**
 * Surah detail page — ayah-by-ayah reader with translations and audio.
 */
import { SurahReader } from '@/components/quran/surah-reader';
import { PageViewTracker } from '@/components/page-view-tracker';
import type { Metadata } from 'next';

interface Props {
    params: Promise<{ surah: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { surah } = await params;
    return {
        title: `Surah ${surah} | Al-Quran`,
        description: `Baca Surah ${surah} dengan terjemahan dan audio`,
    };
}

export default async function SurahPage({ params }: Props) {
    const { surah } = await params;
    const surahNumber = parseInt(surah, 10);

    if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        return (
            <div className="glass-card rounded-xl p-8 text-center space-y-3">
                <p className="text-lg font-semibold">Surah tidak dijumpai</p>
                <p className="text-sm text-muted-foreground">
                    Sila pilih surah antara 1 hingga 114.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <PageViewTracker />
            <SurahReader surahNumber={surahNumber} />
        </div>
    );
}
