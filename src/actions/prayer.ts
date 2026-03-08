/**
 * Server actions for prayer times — fetch from JAKIM API and cache in DB.
 */
'use server';

import { createClient } from '@/lib/supabase/server';
import { jakimProvider, type PrayerTimes } from '@/services/prayer-times';
import { DEFAULT_MOSQUE_ID, JAKIM_ZONE_CODE } from '@/lib/constants';
import { getTodayDateString } from '@/lib/utils';

/**
 * Get prayer times for today. Tries DB cache first, then fetches from API.
 * Accepts optional zoneCode for geolocation-based prayer times.
 */
export async function getTodayPrayerTimes(
    zoneCode: string = JAKIM_ZONE_CODE
): Promise<{ data: PrayerTimes | null; error: string | null; source?: string }> {
    const today = getTodayDateString();

    try {
        const supabase = await createClient();

        // 1. Try DB cache (only for default zone — custom zones bypass cache)
        if (zoneCode === JAKIM_ZONE_CODE) {
            const { data: cached } = await supabase
                .from('prayer_times_cache')
                .select('*')
                .eq('mosque_id', DEFAULT_MOSQUE_ID)
                .eq('date', today)
                .single();

            if (cached) {
                return {
                    data: {
                        date: cached.date,
                        subuh: cached.subuh,
                        syuruk: cached.syuruk,
                        zohor: cached.zohor,
                        asar: cached.asar,
                        maghrib: cached.maghrib,
                        isyak: cached.isyak,
                    },
                    error: null,
                    source: 'cache',
                };
            }
        }

        // 2. Fetch from JAKIM API (with timeout + retry built into jakimProvider)
        const times = await jakimProvider.fetchTimes(today, zoneCode);
        if (!times) {
            return { data: null, error: 'Tidak dapat mendapatkan waktu solat dari JAKIM. Sila cuba semula.' };
        }

        // 3. Cache in DB (upsert) — only for default zone
        if (zoneCode === JAKIM_ZONE_CODE) {
            const { error: upsertError } = await supabase.from('prayer_times_cache').upsert({
                mosque_id: DEFAULT_MOSQUE_ID,
                date: times.date,
                subuh: times.subuh,
                syuruk: times.syuruk,
                zohor: times.zohor,
                asar: times.asar,
                maghrib: times.maghrib,
                isyak: times.isyak,
            }, { onConflict: 'mosque_id,date' });

            if (upsertError) {
                console.warn('[Prayer] Cache upsert failed (non-fatal):', upsertError.message);
            }
        }

        return { data: times, error: null, source: 'jakim-api' };
    } catch (err) {
        console.error('[Prayer] getTodayPrayerTimes error:', err);
        return { data: null, error: 'Ralat mendapatkan waktu solat. Sila cuba semula.' };
    }
}

/**
 * Get iqamah settings for the mosque.
 */
export async function getIqamahSettings() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('iqamah_settings')
            .select('*')
            .eq('mosque_id', DEFAULT_MOSQUE_ID);

        if (error) return { data: null, error: error.message };
        return { data, error: null };
    } catch (err) {
        console.error('[Prayer] getIqamahSettings error:', err);
        return { data: null, error: 'Ralat mendapatkan tetapan iqamah.' };
    }
}

/**
 * Update iqamah setting (admin only).
 */
export async function updateIqamahSetting(prayerName: string, offsetMinutes: number, fixedTime?: string | null) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('iqamah_settings')
        .upsert({
            mosque_id: DEFAULT_MOSQUE_ID,
            prayer_name: prayerName,
            offset_minutes: offsetMinutes,
            fixed_time: fixedTime || null,
        }, { onConflict: 'mosque_id,prayer_name' });

    if (error) return { error: error.message };
    return { error: null };
}
