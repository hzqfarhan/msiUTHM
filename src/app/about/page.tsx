/**
 * Mosque Basics / About page — public page with all essential mosque info.
 * Satisfies RC26 mandatory "Mosque Basics" requirement.
 */
import { createClient } from '@/lib/supabase/server';
import { getTodayPrayerTimes, getIqamahSettings } from '@/actions/prayer';
import { getFacilities } from '@/actions/facilities';
import { getEvents } from '@/actions/events';
import { DEFAULT_MOSQUE_ID, PRAYER_DISPLAY } from '@/lib/constants';
import { formatTime12h } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageViewTracker } from '@/components/page-view-tracker';
import {
    MapPin, Phone, Mail, Clock, Building2, Car,
    Accessibility, Calendar, Users, Info,
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tentang Masjid',
    description: 'Maklumat lengkap Masjid Sultan Ibrahim, UTHM — alamat, waktu solat, kemudahan, parkir, dan program.',
};

export default async function AboutPage() {
    // Fetch all data in parallel — reuse existing actions
    const supabase = await createClient();
    const [mosqueResult, prayerResult, iqamahResult, facilitiesResult, eventsResult] = await Promise.all([
        supabase.from('mosques').select('*').eq('id', DEFAULT_MOSQUE_ID).single(),
        getTodayPrayerTimes(),
        getIqamahSettings(),
        getFacilities(),
        getEvents(),
    ]);

    const mosque = mosqueResult.data;
    const prayerTimes = prayerResult.data;
    const iqamahSettings = iqamahResult.data;
    const facilities = facilitiesResult.data;
    const events = eventsResult.data;

    // Separate parking facilities
    const parkingFacilities = facilities?.filter(f =>
        f.category?.toLowerCase().includes('parking') || f.category?.toLowerCase().includes('kereta')
    ) || [];
    const otherFacilities = facilities?.filter(f =>
        !f.category?.toLowerCase().includes('parking') && !f.category?.toLowerCase().includes('kereta')
    ) || [];

    return (
        <div className="space-y-6">
            <PageViewTracker />

            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-xl font-bold">Masjid Sultan Ibrahim, UTHM</h1>
                <p className="text-sm text-muted-foreground">
                    Maklumat lengkap masjid untuk jemaah dan pelawat
                </p>
            </div>

            {/* Mosque Location Map */}
            <Card className="border-border/50 overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex items-center gap-2 p-4 pb-2">
                        <div className="rounded-lg p-2 bg-primary/10">
                            <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <h2 className="font-semibold text-sm">Lokasi Masjid</h2>
                    </div>
                    <div className="relative w-full aspect-[16/9] sm:aspect-[2/1]">
                        <iframe
                            title="Lokasi Masjid Sultan Ibrahim UTHM"
                            src="https://www.openstreetmap.org/export/embed.html?bbox=103.0808%2C1.8560%2C103.0878%2C1.8620&layer=mapnik&marker=1.8590%2C103.0843"
                            className="absolute inset-0 w-full h-full border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                    <div className="p-3 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            Masjid Sultan Ibrahim, Universiti Tun Hussein Onn Malaysia
                        </p>
                        <a
                            href="https://www.google.com/maps/search/?api=1&query=1.8590,103.0843"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline whitespace-nowrap ml-2"
                        >
                            Buka di Maps →
                        </a>
                    </div>
                </CardContent>
            </Card>

            {/* Mosque Info Card */}
            <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg p-2 bg-primary/10">
                            <Info className="h-4 w-4 text-primary" />
                        </div>
                        <h2 className="font-semibold text-sm">Maklumat Masjid</h2>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Masjid Sultan Ibrahim terletak di dalam kampus Universiti Tun Hussein Onn Malaysia (UTHM),
                        Parit Raja, Batu Pahat, Johor. Masjid ini menjadi nadi ibadah bagi warga kampus dan komuniti setempat,
                        menyediakan pelbagai kemudahan dan program keagamaan sepanjang tahun.
                    </p>

                    {mosque?.address && (
                        <div className="flex items-start gap-2 text-xs">
                            <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{mosque.address}</span>
                        </div>
                    )}

                    {mosque?.contact_info?.phone && (
                        <div className="flex items-center gap-2 text-xs">
                            <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                            <a href={`tel:${mosque.contact_info.phone}`} className="text-primary hover:underline">
                                {mosque.contact_info.phone}
                            </a>
                        </div>
                    )}

                    {mosque?.contact_info?.email && (
                        <div className="flex items-center gap-2 text-xs">
                            <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                            <a href={`mailto:${mosque.contact_info.email}`} className="text-primary hover:underline">
                                {mosque.contact_info.email}
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Prayer Times */}
            <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg p-2 bg-secondary/10">
                            <Clock className="h-4 w-4 text-secondary" />
                        </div>
                        <h2 className="font-semibold text-sm">Waktu Solat Hari Ini</h2>
                    </div>

                    {prayerTimes ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {PRAYER_DISPLAY.map((prayer) => {
                                const time = prayerTimes[prayer.key as keyof typeof prayerTimes];
                                if (!time || typeof time !== 'string') return null;
                                const iqamah = iqamahSettings?.find(s => s.prayer_name === prayer.key);
                                return (
                                    <div key={prayer.key} className="glass-card rounded-xl p-2.5 text-center">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                            {prayer.label}
                                        </p>
                                        <p className="font-semibold text-sm">{formatTime12h(time)}</p>
                                        {iqamah && prayer.key !== 'syuruk' && (
                                            <p className="text-[10px] text-primary">
                                                Iqamah +{iqamah.offset_minutes}min
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">Waktu solat tidak tersedia buat masa ini.</p>
                    )}

                    <Link href="/prayer" className="text-xs text-primary hover:underline">
                        Lihat jadual penuh →
                    </Link>
                </CardContent>
            </Card>

            {/* Facilities */}
            <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg p-2 bg-primary-dark/10">
                            <Building2 className="h-4 w-4 text-primary-dark" />
                        </div>
                        <h2 className="font-semibold text-sm">Kemudahan Masjid</h2>
                    </div>

                    {otherFacilities.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {otherFacilities.map((f) => (
                                <div key={f.id} className="flex items-start gap-2 text-xs p-2 rounded-lg bg-accent/30">
                                    <Building2 className="h-3.5 w-3.5 text-primary-dark shrink-0 mt-0.5" />
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium">{f.name}</span>
                                            {f.has_wheelchair_access && (
                                                <Accessibility className="h-3 w-3 text-secondary" />
                                            )}
                                        </div>
                                        {f.location_hint && (
                                            <p className="text-[10px] text-muted-foreground">{f.location_hint}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">Tiada maklumat kemudahan.</p>
                    )}

                    <Link href="/facilities" className="text-xs text-primary hover:underline">
                        Lihat semua kemudahan →
                    </Link>
                </CardContent>
            </Card>

            {/* Parking Info */}
            <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg p-2 bg-navy/10">
                            <Car className="h-4 w-4 text-navy" />
                        </div>
                        <h2 className="font-semibold text-sm">Tempat Letak Kereta</h2>
                    </div>

                    {parkingFacilities.length > 0 ? (
                        parkingFacilities.map((p) => (
                            <div key={p.id} className="text-xs space-y-1">
                                <p className="font-medium">{p.name}</p>
                                {p.description && (
                                    <p className="text-muted-foreground">{p.description}</p>
                                )}
                                {p.location_hint && (
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <MapPin className="h-3 w-3" /> {p.location_hint}
                                    </div>
                                )}
                                {p.has_wheelchair_access && (
                                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                        <Accessibility className="h-2.5 w-2.5 mr-0.5" /> Akses OKU
                                    </Badge>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>Parkir terbuka tersedia di kawasan masjid dan sekitar kampus UTHM.</p>
                            <p>Tempat letak kereta percuma dan terbuka kepada semua jemaah.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg p-2 bg-primary/10">
                            <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <h2 className="font-semibold text-sm">Program & Acara Akan Datang</h2>
                    </div>

                    {events && events.length > 0 ? (
                        <div className="space-y-2">
                            {events.slice(0, 5).map((event) => {
                                const startDate = new Date(event.start_at);
                                return (
                                    <Link key={event.id} href={`/events/${event.id}`} className="block">
                                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors">
                                            <div className="shrink-0 flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                                                <span className="text-sm font-bold leading-none">{startDate.getDate()}</span>
                                                <span className="text-[8px] uppercase">
                                                    {startDate.toLocaleDateString('ms-MY', { month: 'short', timeZone: 'Asia/Kuala_Lumpur' })}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-xs truncate">{event.title}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {startDate.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kuala_Lumpur' })}
                                                    {event.location && ` · ${event.location}`}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">Tiada program akan datang buat masa ini.</p>
                    )}

                    <Link href="/events" className="text-xs text-primary hover:underline">
                        Lihat semua program →
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
