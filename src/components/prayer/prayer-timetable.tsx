/**
 * Prayer Timetable component — compact 2-column grid so all prayers fit without scrolling.
 */
'use client';

import { PRAYER_DISPLAY } from '@/lib/constants';
import { formatTime12h } from '@/lib/utils';
import { calculateIqamahTime, getNextPrayer, type PrayerTimes } from '@/services/prayer-times';
import type { IqamahSetting, PrayerName } from '@/lib/types/database';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface Props {
    prayerTimes: PrayerTimes | null;
    iqamahSettings: IqamahSetting[] | null;
    error: string | null;
}

export function PrayerTimetable({ prayerTimes, iqamahSettings, error }: Props) {
    const [currentPrayer, setCurrentPrayer] = useState<PrayerName | null>(null);

    useEffect(() => {
        if (!prayerTimes) return;
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const next = getNextPrayer(prayerTimes, currentTime);
        if (next) setCurrentPrayer(next.name);
    }, [prayerTimes]);

    if (error || !prayerTimes) {
        return (
            <div className="glass-card rounded-2xl p-6 text-center text-muted-foreground">
                <p>Tidak dapat memuatkan waktu solat.</p>
                <p className="text-xs mt-1">{error}</p>
            </div>
        );
    }

    const todayStr = new Date().toLocaleDateString('ms-MY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Kuala_Lumpur',
    });

    return (
        <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center">{todayStr}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRAYER_DISPLAY.map((prayer) => {
                    const time = prayerTimes[prayer.key as keyof PrayerTimes];
                    if (!time || typeof time !== 'string') return null;

                    const iqamahSetting = iqamahSettings?.find((s) => s.prayer_name === prayer.key);
                    const iqamahTime = iqamahSetting
                        ? calculateIqamahTime(time, iqamahSetting.offset_minutes, iqamahSetting.fixed_time)
                        : null;

                    const isNext = currentPrayer === prayer.key;

                    return (
                        <div
                            key={prayer.key}
                            className={cn(
                                'rounded-xl px-3 py-2.5 transition-all duration-300',
                                isNext
                                    ? 'liquid-btn liquid-btn-emerald glow-emerald'
                                    : 'glass-card',
                            )}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className={cn(
                                        'font-semibold text-xs truncate',
                                        isNext && 'text-primary'
                                    )}>
                                        {prayer.label}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground truncate">{prayer.labelEn}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={cn(
                                        'font-bold text-sm tabular-nums',
                                        isNext && 'text-primary'
                                    )}>
                                        {formatTime12h(time)}
                                    </p>
                                    {iqamahTime && (
                                        <p className="text-[9px] text-muted-foreground">
                                            Iqamah {formatTime12h(iqamahTime)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {isNext && (
                                <div className="mt-1.5 h-0.5 rounded-full bg-gradient-to-r from-emerald-500/60 via-emerald-400 to-emerald-500/60" />
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="text-[10px] text-center text-muted-foreground pt-1">
                Sumber: JAKIM e-Solat (Zon JHR01) · Iqamah ditetapkan oleh pihak masjid
            </p>
        </div>
    );
}
