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
 */
export async function getTodayPrayerTimes(): Promise<{ data: PrayerTimes | null; error: string | null }> {
    const today = getTodayDateString();
    const supabase = await createClient();

    // 1. Try cache
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
        };
    }

    // 2. Fetch from JAKIM API
    const times = await jakimProvider.fetchTimes(today, JAKIM_ZONE_CODE);
    if (!times) {
        return { data: null, error: 'Tidak dapat mendapatkan waktu solat' };
    }

    // 3. Cache in DB (upsert)
    await supabase.from('prayer_times_cache').upsert({
        mosque_id: DEFAULT_MOSQUE_ID,
        date: times.date,
        subuh: times.subuh,
        syuruk: times.syuruk,
        zohor: times.zohor,
        asar: times.asar,
        maghrib: times.maghrib,
        isyak: times.isyak,
    }, { onConflict: 'mosque_id,date' });

    return { data: times, error: null };
}

/**
 * Get iqamah settings for the mosque.
 */
export async function getIqamahSettings() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('iqamah_settings')
        .select('*')
        .eq('mosque_id', DEFAULT_MOSQUE_ID);

    if (error) return { data: null, error: error.message };
    return { data, error: null };
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
