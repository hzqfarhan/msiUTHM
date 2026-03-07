/**
 * ICS Calendar endpoint — generates .ics file for an event.
 * GET /api/events/[id]/ics
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function formatICSDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeICS(text: string): string {
    return text.replace(/[\\;,\n]/g, (match) => {
        if (match === '\n') return '\\n';
        return `\\${match}`;
    });
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const start = new Date(event.start_at);
    const end = event.end_at ? new Date(event.end_at) : new Date(start.getTime() + 60 * 60 * 1000);
    const now = new Date();
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://msi-uthm.vercel.app'}/events/${id}`;

    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//MSI UTHM Companion//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${id}@msi-uthm`,
        `DTSTART:${formatICSDate(start)}`,
        `DTEND:${formatICSDate(end)}`,
        `DTSTAMP:${formatICSDate(now)}`,
        `SUMMARY:${escapeICS(event.title)}`,
        event.description ? `DESCRIPTION:${escapeICS(event.description)}` : '',
        event.location ? `LOCATION:${escapeICS(event.location)}` : '',
        `URL:${url}`,
        'END:VEVENT',
        'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');

    return new NextResponse(ics, {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `attachment; filename="${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`,
        },
    });
}
