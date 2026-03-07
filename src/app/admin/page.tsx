/**
 * Admin Dashboard — overview with key stats.
 */
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, MessageSquare, BarChart3, Megaphone, Eye } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch stats in parallel
    const [events, rsvps, feedback, announcements, analytics] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('event_rsvps').select('*', { count: 'exact', head: true }),
        supabase.from('feedback_reports').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('announcements').select('*', { count: 'exact', head: true }),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }),
    ]);

    const stats = [
        { label: 'Jumlah Program', value: events.count || 0, icon: Calendar, color: 'text-secondary bg-secondary/10' },
        { label: 'Jumlah RSVP', value: rsvps.count || 0, icon: Users, color: 'text-primary bg-primary/10' },
        { label: 'Pengumuman', value: announcements.count || 0, icon: Megaphone, color: 'text-primary-dark bg-primary-dark/10' },
        { label: 'Maklum Balas Baru', value: feedback.count || 0, icon: MessageSquare, color: 'text-accent bg-accent/20' },
        { label: 'Peristiwa Analitik', value: analytics.count || 0, icon: BarChart3, color: 'text-primary bg-primary/10' },
    ];

    return (
        <div className="space-y-4">
            <h2 className="font-semibold text-sm">Ringkasan</h2>

            <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-border/50">
                        <CardContent className="p-3.5 flex items-center gap-3">
                            <div className={`rounded-lg p-2 ${stat.color}`}>
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
        </div>
    );
}
