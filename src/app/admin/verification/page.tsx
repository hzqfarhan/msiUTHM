/**
 * Admin Verification page — displays key stats for RC26 challenge verification.
 */
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_MOSQUE_ID } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import {
    ShieldCheck, MapPin, Users, Calendar, UserCheck,
    Globe, Mail, BarChart3,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pengesahan RC26' };

export default async function AdminVerificationPage() {
    const supabase = await createClient();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [mosque, totalUsers, activeUsers, totalEvents, totalRsvps, adminProfile] = await Promise.all([
        supabase.from('mosques').select('*').eq('id', DEFAULT_MOSQUE_ID).single(),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase
            .from('analytics_events')
            .select('user_id')
            .not('user_id', 'is', null)
            .gte('created_at', sevenDaysAgo),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('event_rsvps').select('*', { count: 'exact', head: true }),
        supabase.auth.getUser(),
    ]);

    const activeUserCount = new Set(activeUsers.data?.map(e => e.user_id)).size;

    const stats = [
        { label: 'Jumlah Pengguna', value: totalUsers.count || 0, icon: Users },
        { label: 'Aktif (7 Hari)', value: activeUserCount, icon: UserCheck },
        { label: 'Jumlah Program', value: totalEvents.count || 0, icon: Calendar },
        { label: 'Jumlah RSVP', value: totalRsvps.count || 0, icon: BarChart3 },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <div>
                    <h2 className="font-semibold text-sm">Pengesahan RC26</h2>
                    <p className="text-[10px] text-muted-foreground">Maklumat untuk pengesahan cabaran</p>
                </div>
            </div>

            {/* Mosque Info */}
            <Card className="border-border/50 border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-sm">{mosque.data?.name || 'Masjid Sultan Ibrahim, UTHM'}</h3>
                    {mosque.data?.address && (
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-500" />
                            <span>{mosque.data.address}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <span className="font-mono text-[10px]">{process.env.NEXT_PUBLIC_SITE_URL || 'https://msi-uthm.vercel.app'}</span>
                    </div>
                    {adminProfile.data?.user?.email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            <span>{adminProfile.data.user.email}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-border/50">
                        <CardContent className="p-3.5 flex items-center gap-3">
                            <div className="rounded-lg p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                <stat.icon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-lg font-bold">{stat.value}</p>
                                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Timestamp */}
            <p className="text-[10px] text-muted-foreground text-center">
                Data dijana pada: {new Date().toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' })}
            </p>
        </div>
    );
}
