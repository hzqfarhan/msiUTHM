/**
 * Admin Analytics page — key growth metrics.
 */
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Eye, Users, MousePointer, Calendar, Download } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Analitik' };

export default async function AdminAnalyticsPage() {
    const supabase = await createClient();

    // Get analytics data
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [pageViews, uniqueSessions, rsvpEvents, installs, topPages] = await Promise.all([
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_name', 'page_view'),
        supabase.from('analytics_events').select('session_id').eq('event_name', 'page_view'),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_name', 'rsvp'),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_name', 'pwa_install'),
        // Top pages - last 7 days
        supabase
            .from('analytics_events')
            .select('page_path')
            .eq('event_name', 'page_view')
            .gte('created_at', sevenDaysAgo)
            .limit(500),
    ]);

    // Calculate unique sessions
    const uniqueSessionCount = new Set(uniqueSessions.data?.map((e) => e.session_id)).size;

    // Calculate top pages
    const pageCounts: Record<string, number> = {};
    topPages.data?.forEach((e) => {
        const path = e.page_path || '/';
        pageCounts[path] = (pageCounts[path] || 0) + 1;
    });
    const sortedPages = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const stats = [
        { label: 'Jumlah Page Views', value: pageViews.count || 0, icon: Eye },
        { label: 'Pelawat Unik', value: uniqueSessionCount, icon: Users },
        { label: 'RSVP Dibuat', value: rsvpEvents.count || 0, icon: Calendar },
        { label: 'Pasang PWA', value: installs.count || 0, icon: Download },
    ];

    return (
        <div className="space-y-4">
            <div>
                <h2 className="font-semibold text-sm">Analitik</h2>
                <p className="text-xs text-muted-foreground">Metrik penggunaan MSI UTHM Companion</p>
            </div>

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

            {/* Top Pages */}
            <Card className="border-border/50">
                <CardContent className="p-4 space-y-2">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Halaman Paling Popular (7 hari)
                    </h3>
                    {sortedPages.length === 0 && (
                        <p className="text-xs text-muted-foreground">Belum ada data.</p>
                    )}
                    {sortedPages.map(([path, count], i) => (
                        <div key={path} className="flex items-center justify-between text-sm">
                            <span className="text-xs text-muted-foreground">
                                {i + 1}. <code className="text-foreground">{path}</code>
                            </span>
                            <span className="font-medium text-xs">{count}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
