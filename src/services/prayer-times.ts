/**
 * Prayer Times Service
 * Fetches prayer times from JAKIM e-Solat API with:
 *  - 5s timeout via AbortController
 *  - 1 retry on failure
 *  - In-memory server cache (avoids refetching within same server instance)
 *  - Provider interface for future swapping
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

// ─── In-memory cache (Fix 5) ───────────────────────────────
// Caches the entire monthly JAKIM response keyed by "zone-YYYY-MM"
// so multiple prayer page visits don't re-fetch the same month.
const monthlyCache = new Map<string, { data: Record<string, string>[]; fetchedAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCacheKey(zoneCode: string, yearMonth: string): string {
    return `${zoneCode}-${yearMonth}`;
}

/**
 * Fetch with timeout + 1 retry (Fix 2).
 */
async function fetchWithRetry(url: string, timeoutMs = 5000): Promise<Response> {
    for (let attempt = 0; attempt < 2; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timer);
            if (res.ok) return res;
            console.warn(`[Prayer] JAKIM API attempt ${attempt + 1}: status ${res.status}`);
        } catch (err) {
            clearTimeout(timer);
            if (attempt === 0) {
                console.warn(`[Prayer] JAKIM API attempt 1 failed, retrying...`, err instanceof Error ? err.message : err);
                continue;
            }
            throw err;
        }
    }
    throw new Error('JAKIM API failed after 2 attempts');
}

/**
 * JAKIM e-Solat API provider.
 * API: https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat
 * Returns monthly data for a given zone code.
 */
export const jakimProvider: PrayerTimesProvider = {
    async fetchTimes(date: string, zoneCode: string = JAKIM_ZONE_CODE): Promise<PrayerTimes | null> {
        try {
            const [year, month, day] = date.split('-');
            const yearMonth = `${year}-${month}`;
            const cacheKey = getCacheKey(zoneCode, yearMonth);

            // Check memory cache first
            const cached = monthlyCache.get(cacheKey);
            if (cached && (Date.now() - cached.fetchedAt) < CACHE_TTL_MS) {
                const entry = findEntryForDate(cached.data, parseInt(day), parseInt(month));
                if (entry) return formatEntry(entry, date);
            }

            // Fetch from JAKIM API with timeout + retry
            const url = `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=month&zone=${zoneCode}`;
            const response = await fetchWithRetry(url, 5000);
            const data = await response.json();

            const allTimes = data.prayerTime || data.ppiayerTime || [];
            if (!allTimes.length) {
                console.error('[Prayer] JAKIM API: empty prayer time array, status:', data.status);
                return null;
            }

            // Store in memory cache
            monthlyCache.set(cacheKey, { data: allTimes, fetchedAt: Date.now() });

            // Find today's entry
            const entry = findEntryForDate(allTimes, parseInt(day), parseInt(month));
            if (!entry) {
                console.error('[Prayer] No entry for date:', date, 'in', allTimes.length, 'entries');
                return null;
            }

            return formatEntry(entry, date);
        } catch (error) {
            console.error('[Prayer] Fetch error:', error instanceof Error ? error.message : error);
            return null;
        }
    },
};

/** Find the entry within the monthly array matching a specific day+month */
function findEntryForDate(entries: Record<string, string>[], targetDay: number, targetMonth: number): Record<string, string> | undefined {
    return entries.find((t) => {
        if (!t.date) return false;
        const d = new Date(t.date);
        return d.getDate() === targetDay && (d.getMonth() + 1) === targetMonth;
    });
}

/** Parse a JAKIM entry into our normalized PrayerTimes format */
function formatEntry(entry: Record<string, string>, date: string): PrayerTimes {
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
}

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
