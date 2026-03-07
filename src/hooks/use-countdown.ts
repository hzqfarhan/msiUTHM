/**
 * Hook: Real-time countdown to next prayer.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PrayerTimes } from '@/services/prayer-times';
import { getNextPrayer, calculateIqamahTime } from '@/services/prayer-times';
import { PRAYER_DISPLAY } from '@/lib/constants';
import type { IqamahSetting, PrayerName } from '@/lib/types/database';

interface CountdownState {
    nextPrayer: { name: PrayerName; time: string; label: string } | null;
    nextIqamah: string | null;
    hours: number;
    minutes: number;
    seconds: number;
    currentTime: string;
}

export function useCountdown(
    prayerTimes: PrayerTimes | null,
    iqamahSettings: IqamahSetting[] | null,
) {
    const [state, setState] = useState<CountdownState>({
        nextPrayer: null,
        nextIqamah: null,
        hours: 0,
        minutes: 0,
        seconds: 0,
        currentTime: '',
    });

    const update = useCallback(() => {
        if (!prayerTimes) return;

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const next = getNextPrayer(prayerTimes, currentTime);

        if (!next) return;

        const display = PRAYER_DISPLAY.find(p => p.key === next.name);
        const label = display?.label || next.name;

        // Calculate iqamah
        let nextIqamah: string | null = null;
        if (iqamahSettings) {
            const setting = iqamahSettings.find(s => s.prayer_name === next.name);
            if (setting) {
                nextIqamah = calculateIqamahTime(next.time, setting.offset_minutes, setting.fixed_time);
            }
        }

        // Calculate countdown
        const [targetH, targetM] = next.time.split(':').map(Number);
        const target = new Date();
        target.setHours(targetH, targetM, 0, 0);
        if (target <= now) {
            target.setDate(target.getDate() + 1);
        }

        const diff = target.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setState({
            nextPrayer: { name: next.name, time: next.time, label },
            nextIqamah,
            hours,
            minutes,
            seconds,
            currentTime: now.toLocaleTimeString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' }),
        });
    }, [prayerTimes, iqamahSettings]);

    useEffect(() => {
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [update]);

    return state;
}
