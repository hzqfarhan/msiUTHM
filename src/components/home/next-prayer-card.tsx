/**
 * Next Prayer Card — glass morphism countdown card.
 */
'use client';

import { useCountdown } from '@/hooks/use-countdown';
import { Clock } from 'lucide-react';
import { formatTime12h } from '@/lib/utils';
import type { PrayerTimes } from '@/services/prayer-times';
import type { IqamahSetting } from '@/lib/types/database';

interface Props {
    prayerTimes: PrayerTimes | null;
    iqamahSettings: IqamahSetting[] | null;
}

export function NextPrayerCard({ prayerTimes, iqamahSettings }: Props) {
    const { nextPrayer, nextIqamah, hours, minutes, seconds, currentTime } = useCountdown(
        prayerTimes,
        iqamahSettings,
    );

    if (!prayerTimes || !nextPrayer) {
        return (
            <div className="glass-card glass-shimmer rounded-2xl p-5 text-center">
                <p className="text-sm text-muted-foreground">Memuatkan waktu solat...</p>
            </div>
        );
    }

    return (
        <div className="relative rounded-2xl overflow-hidden glass-card glass-shimmer glow-emerald">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-emerald-700/10 to-teal-800/20 pointer-events-none" />

            {/* Decorative orbs */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-teal-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

            <div className="relative p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{currentTime}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-medium text-emerald-500 dark:text-emerald-400 glass-badge">
                        Solat Seterusnya
                    </span>
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{nextPrayer.label}</h2>
                    <p className="text-muted-foreground text-sm">
                        {formatTime12h(nextPrayer.time)}
                        {nextIqamah && (
                            <span className="ml-2 opacity-70">
                                · Iqamah {formatTime12h(nextIqamah)}
                            </span>
                        )}
                    </p>

                    {/* Countdown */}
                    <div className="flex items-center justify-center gap-2 pt-2">
                        <CountdownUnit value={hours} label="Jam" />
                        <span className="text-xl font-light text-muted-foreground/40 -mt-3">:</span>
                        <CountdownUnit value={minutes} label="Min" />
                        <span className="text-xl font-light text-muted-foreground/40 -mt-3">:</span>
                        <CountdownUnit value={seconds} label="Saat" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-3xl font-bold tabular-nums leading-none text-foreground">
                {String(value).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1">
                {label}
            </span>
        </div>
    );
}
