/**
 * Prayer Times page — full today's timetable with iqamah times.
 */
import { getTodayPrayerTimes, getIqamahSettings } from '@/actions/prayer';
import { PrayerTimetable } from '@/components/prayer/prayer-timetable';
import { PageViewTracker } from '@/components/page-view-tracker';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Waktu Solat',
    description: 'Waktu solat dan iqamah Masjid Sultan Ibrahim, UTHM',
};

export const revalidate = 300; // 5 minutes ISR

export default async function PrayerPage() {
    const [prayerResult, iqamahResult] = await Promise.all([
        getTodayPrayerTimes(),
        getIqamahSettings(),
    ]);

    return (
        <div className="space-y-4">
            <PageViewTracker />
            <div>
                <h1 className="text-xl font-bold">Waktu Solat</h1>
                <p className="text-sm text-muted-foreground">
                    Masjid Sultan Ibrahim, UTHM — Zon JHR01
                </p>
            </div>
            <PrayerTimetable
                prayerTimes={prayerResult.data}
                iqamahSettings={iqamahResult.data}
                error={prayerResult.error}
            />
        </div>
    );
}
