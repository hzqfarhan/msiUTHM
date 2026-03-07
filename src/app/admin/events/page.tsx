/**
 * Admin Events page — list + create/edit events.
 */
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { deleteEvent } from '@/actions/events';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Urus Program' };

export default async function AdminEventsPage() {
    const supabase = await createClient();
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .order('start_at', { ascending: false });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm">Urus Program</h2>
                <Button size="sm" asChild className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/admin/events/new/edit">
                        <Plus className="mr-1 h-3 w-3" /> Tambah Program
                    </Link>
                </Button>
            </div>

            {!events?.length && (
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground text-sm">
                        Tiada program. Klik &quot;Tambah Program&quot; untuk mula.
                    </CardContent>
                </Card>
            )}

            <div className="space-y-2">
                {events?.map((event) => (
                    <Card key={event.id} className="border-border/50">
                        <CardContent className="p-3.5 flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-sm truncate">{event.title}</h3>
                                    <Badge variant={event.is_published ? 'default' : 'secondary'} className="text-[10px] h-4 shrink-0">
                                        {event.is_published ? 'Aktif' : 'Draf'}
                                    </Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    {new Date(event.start_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' })}
                                </p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                    <Link href={`/admin/events/${event.id}/edit`}>
                                        <Edit className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                                <form action={async () => { 'use server'; await deleteEvent(event.id); }}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
