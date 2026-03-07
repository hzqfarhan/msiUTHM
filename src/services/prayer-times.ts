/**
 * Prayer Times Service
 * Fetches prayer times from JAKIM e-Solat API and caches in Supabase.
 * Provider interface allows swapping data sources easily.
 */

import { JAKIM_ZONE_CODE } from '@/lib/constants';
import type { PrayerName } from '@/lib/types/database';

// Normalized prayer times format
export interface PrayerTimes {
    date: string;                    // YYYY-MM-DD
    subuh: string;                   // HH:mm
    syuruk: string;
    zohor: string;
    asar: string;
    maghrib: string;
    isyak: string;
}

// Provider interface — can swap JAKIM for another source
interface PrayerTimesProvider {
    fetchTimes(date: string, zoneCode: string): Promise<PrayerTimes | null>;
}

/**
 * JAKIM e-Solat API provider.
 * API: https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat
 * Returns monthly data for a given zone code.
 */
export const jakimProvider: PrayerTimesProvider = {
    async fetchTimes(date: string, zoneCode: string = JAKIM_ZONE_CODE): Promise<PrayerTimes | null> {
        try {
            // JAKIM API expects period=month and zone code
            const [year, month] = date.split('-');
            const url = `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=month&zone=${zoneCode}`;

            const response = await fetch(url, {
                next: { revalidate: 86400 }, // Cache for 24 hours
            });

            if (!response.ok) {
                console.error('[Prayer] JAKIM API error:', response.status);
                return null;
            }

            const data = await response.json();

            if (data.status !== 'OK!' || !data.ppiayerTime) {
                // Try alternate field name
                const times = data.ppiayerTime || data.prayerTime;
                if (!times) {
                    console.error('[Prayer] JAKIM API: no prayer time data', data.status);
                    return null;
                }
            }

            const allTimes = data.ppiayerTime || data.prayerTime || [];

            // Find the entry matching our target date
            // JAKIM date format: "DD-MMM-YYYY" e.g., "01-Mar-2026"
            const targetDay = parseInt(date.split('-')[2]);
            const targetMonth = parseInt(date.split('-')[1]);
            const entry = allTimes.find((t: Record<string, string>) => {
                if (t.date) {
                    const d = new Date(t.date);
                    return d.getDate() === targetDay && (d.getMonth() + 1) === targetMonth;
                }
                return false;
            });

            if (!entry) {
                console.error('[Prayer] No entry found for date:', date);
                return null;
            }

            // Parse times — JAKIM returns "HH:mm:ss" format
            const parseTime = (t: string) => t?.substring(0, 5) || '00:00';

            return {
                date,
                subuh: parseTime(entry.fajr || entry.imsak),
                syuruk: parseTime(entry.syuruk || entry.sunrise),
                zohor: parseTime(entry.dhuhr || entry.zohor),
                asar: parseTime(entry.asr || entry.asar),
                maghrib: parseTime(entry.maghrib),
                isyak: parseTime(entry.isha || entry.isyak),
            };
        } catch (error) {
            console.error('[Prayer] Fetch error:', error);
            return null;
        }
    },
};

/**
 * Get the next prayer given the current prayer times and current time.
 */
export function getNextPrayer(
    times: PrayerTimes,
    currentTime: string, // HH:mm format
): { name: PrayerName; time: string } | null {
    const prayerOrder: PrayerName[] = ['subuh', 'syuruk', 'zohor', 'asar', 'maghrib', 'isyak'];

    for (const name of prayerOrder) {
        if (times[name] > currentTime) {
            return { name, time: times[name] };
        }
    }

    // After isyak, next prayer is tomorrow's subuh
    return { name: 'subuh', time: times.subuh };
}

/**
 * Calculate iqamah time based on prayer time + offset.
 */
export function calculateIqamahTime(
    prayerTime: string,
    offsetMinutes: number,
    fixedTime?: string | null,
): string {
    if (fixedTime) return fixedTime;

    const [h, m] = prayerTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + offsetMinutes;
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = totalMinutes % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}
