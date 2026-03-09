/**
 * Prayer Timetable component — compact 2-column grid so all prayers fit without scrolling.
 * Enhanced with: countdown, Hijri date, daily reminder, zone info, quick actions.
 */
'use client';

import { PRAYER_DISPLAY } from '@/lib/constants';
import { formatTime12h } from '@/lib/utils';
import { calculateIqamahTime, getNextPrayer, type PrayerTimes } from '@/services/prayer-times';
import type { IqamahSetting, PrayerName } from '@/lib/types/database';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useCountdown } from '@/hooks/use-countdown';
import { getHijriDate } from '@/lib/hijri';
import Link from 'next/link';
import { Compass, Calendar, Bot, Clock, Info } from 'lucide-react';

interface Props {
    prayerTimes: PrayerTimes | null;
    iqamahSettings: IqamahSetting[] | null;
    error: string | null;
}

/* ─── Daily reminders pool ─────────────────────────────────── */
const DAILY_REMINDERS = [
    {
        text: 'Sesungguhnya solat itu adalah kewajipan yang ditentukan waktunya atas orang-orang yang beriman.',
        source: 'Surah An-Nisa&apos; 4:103',
    },
    {
        text: 'Peliharalah semua solat dan solat wusta (Asar). Dan berdirilah kerana Allah dengan penuh khusyuk.',
        source: 'Surah Al-Baqarah 2:238',
    },
    {
        text: 'Dirikanlah solat, sesungguhnya solat itu mencegah daripada perbuatan keji dan mungkar.',
        source: 'Surah Al-Ankabut 29:45',
    },
    {
        text: 'Amalan yang pertama kali dihisab ke atas hamba pada hari kiamat ialah solat.',
        source: 'HR Abu Dawud',
    },
    {
        text: 'Sesiapa yang menjaga solat lima waktu, nescaya ia mendapat cahaya, bukti, dan keselamatan pada hari kiamat.',
        source: 'HR Ahmad',
    },
    {
        text: 'Solat itu tiang agama. Sesiapa yang mendirikannya, maka ia telah mendirikan agama.',
        source: 'HR Baihaqi',
    },
    {
        text: 'Apabila kamu berdiri untuk solat, maka solatlah seperti orang yang hendak meninggalkan dunia.',
        source: 'HR Ibn Majah',
    },
];

function getDailyReminder() {
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
    );
    return DAILY_REMINDERS[dayOfYear % DAILY_REMINDERS.length];
}

export function PrayerTimetable({ prayerTimes, iqamahSettings, error }: Props) {
    const [currentPrayer, setCurrentPrayer] = useState<PrayerName | null>(null);
    const countdown = useCountdown(prayerTimes, iqamahSettings);
    const [hijriDate, setHijriDate] = useState('');
    const [gregorianDate, setGregorianDate] = useState('');
    const [reminder] = useState(() => getDailyReminder());

    useEffect(() => {
        if (!prayerTimes) return;
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const next = getNextPrayer(prayerTimes, currentTime);
        if (next) setCurrentPrayer(next.name);

        // Dates
        setHijriDate(getHijriDate(now));
        setGregorianDate(
            now.toLocaleDateString('ms-MY', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'Asia/Kuala_Lumpur',
            }),
        );
    }, [prayerTimes]);

    if (error || !prayerTimes) {
        return (
            <div className="glass-card rounded-2xl p-6 text-center text-muted-foreground">
                <p>Tidak dapat memuatkan waktu solat.</p>
                <p className="text-xs mt-1">{error}</p>
            </div>
        );
    }

    /* ─── Countdown text ─────────────────────────────── */
    const countdownText = countdown.nextPrayer
        ? (() => {
            const parts: string[] = [];
            if (countdown.hours > 0) parts.push(`${countdown.hours} jam`);
            if (countdown.minutes > 0) parts.push(`${countdown.minutes} minit`);
            if (parts.length === 0) parts.push(`${countdown.seconds} saat`);
            return `${countdown.nextPrayer.label} dalam ${parts.join(' ')}`;
        })()
        : null;

    return (
        <div className="space-y-3">
            {/* ─── Hijri + Gregorian Date ─────────────────────── */}
            <div className="text-center space-y-0.5">
                <p className="text-xs text-muted-foreground">{gregorianDate}</p>
                {hijriDate && (
                    <p className="text-[11px] text-primary/80 font-medium">{hijriDate}</p>
                )}
            </div>

            {/* ─── Next Prayer Countdown Banner ──────────────── */}
            {countdownText && (
                <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 shrink-0">
                        <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                            Solat Seterusnya
                        </p>
                        <p className="text-sm font-semibold text-foreground truncate">
                            {countdownText}
                        </p>
                    </div>
                    {countdown.nextPrayer && (
                        <p className="ml-auto text-primary font-bold text-sm tabular-nums shrink-0">
                            {formatTime12h(countdown.nextPrayer.time)}
                        </p>
                    )}
                </div>
            )}

            {/* ─── Prayer Cards Grid (PRESERVED) ────────────── */}
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

            {/* ─── Zone / Source Info ─────────────────────────── */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-1">
                <Info className="h-3 w-3 shrink-0" />
                <span>Sumber: JAKIM e-Solat (Zon JHR04) · Iqamah ditetapkan oleh pihak masjid</span>
            </div>

            {/* ─── Daily Reminder ────────────────────────────── */}
            <div className="glass-card rounded-xl px-4 py-3 space-y-1.5">
                <p className="text-[10px] text-primary/70 font-semibold uppercase tracking-wider">
                    Peringatan Harian
                </p>
                <p className="text-xs text-foreground/80 leading-relaxed italic">
                    &ldquo;{reminder.text}&rdquo;
                </p>
                <p className="text-[10px] text-muted-foreground text-right">
                    — {reminder.source}
                </p>
            </div>

            {/* ─── Quick Actions ─────────────────────────────── */}
            <div className="grid grid-cols-3 gap-2">
                <Link
                    href="/qibla"
                    className="glass-card rounded-xl px-3 py-2.5 flex flex-col items-center gap-1.5 hover:border-primary/30 transition-colors group"
                >
                    <Compass className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        Kiblat
                    </span>
                </Link>
                <Link
                    href="/events"
                    className="glass-card rounded-xl px-3 py-2.5 flex flex-col items-center gap-1.5 hover:border-primary/30 transition-colors group"
                >
                    <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        Program
                    </span>
                </Link>
                <Link
                    href="/"
                    className="glass-card rounded-xl px-3 py-2.5 flex flex-col items-center gap-1.5 hover:border-primary/30 transition-colors group"
                    onClick={(e) => {
                        // Open MSIBot FAB if available
                        e.preventDefault();
                        const fab = document.querySelector('[data-msibot-fab]') as HTMLButtonElement | null;
                        if (fab) fab.click();
                        else window.location.href = '/';
                    }}
                >
                    <Bot className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        MSIBot
                    </span>
                </Link>
            </div>
        </div>
    );
}
