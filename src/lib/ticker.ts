/**
 * Ticker data helper — server-side only.
 * Fetches prayer times and user count from Supabase,
 * then builds the ticker items array.
 */
'use server';

import { createClient } from '@/lib/supabase/server';
import { getTodayPrayerTimes } from '@/actions/prayer';
import { getNextPrayer, type PrayerTimes } from '@/services/prayer-times';
import { formatTime12h } from '@/lib/utils';
import { PRAYER_DISPLAY } from '@/lib/constants';

export interface TickerItem {
    id: string;
    text: string;
    highlight?: string; // teal-highlighted portion
}

/**
 * Get the display label for a prayer key.
 */
function getPrayerLabel(key: string): string {
    const found = PRAYER_DISPLAY.find(p => p.key === key);
    return found ? found.label.toUpperCase() : key.toUpperCase();
}

/**
 * Get current time in HH:mm format (Malaysia timezone).
 */
function getCurrentTimeMY(): string {
    return new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kuala_Lumpur',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

/**
 * Build ticker items with real Supabase data + static text.
 * Called server-side, cached by Next.js ISR / revalidation.
 */
export async function getTickerItems(): Promise<TickerItem[]> {
    const items: TickerItem[] = [];

    // 1. Next Prayer (real data)
    try {
        const { data: prayerTimes } = await getTodayPrayerTimes();
        if (prayerTimes) {
            const currentTime = getCurrentTimeMY();
            const next = getNextPrayer(prayerTimes, currentTime);
            if (next) {
                const label = getPrayerLabel(next.name);
                const time12 = formatTime12h(next.time);
                items.push({
                    id: 'next-prayer',
                    text: 'SOLAT SETERUSNYA:',
                    highlight: `${label} ${time12}`,
                });
            }
        }
    } catch {
        // fallback
    }
    if (!items.find(i => i.id === 'next-prayer')) {
        items.push({
            id: 'next-prayer',
            text: 'SOLAT SETERUSNYA:',
            highlight: 'LIHAT WAKTU SOLAT',
        });
    }

    // 2. Total Users (real data)
    try {
        const supabase = await createClient();
        const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (count !== null) {
            items.push({
                id: 'total-users',
                text: 'JUMLAH PENGGUNA:',
                highlight: `${count}`,
            });
        }
    } catch {
        items.push({
            id: 'total-users',
            text: 'KOMUNITI PENGGUNA AKTIF',
        });
    }

    // 3–6. Static items
    items.push(
        { id: 'location', text: 'MSI UTHM, PARIT RAJA' },
        { id: 'infaq', text: 'MAKLUMAT INFAQ TERSEDIA', highlight: 'INFAQ' },
        { id: 'msibot', text: 'CUBA MSIBOT UNTUK BANTUAN PANTAS' },
        { id: 'community', text: 'DIBINA UNTUK KOMUNITI MSI UTHM' },
    );

    return items;
}
