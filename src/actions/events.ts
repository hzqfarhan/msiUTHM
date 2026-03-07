/**
 * Server actions for events.
 */
'use server';

import { createClient } from '@/lib/supabase/server';
import { createEventSchema } from '@/lib/validators/event';
import { DEFAULT_MOSQUE_ID } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

export async function getEvents() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .gte('start_at', new Date().toISOString())
        .order('start_at', { ascending: true });

    if (error) return { error: error.message, data: null };
    return { data, error: null };
}

export async function getEventById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return { error: error.message, data: null };
    return { data, error: null };
}

export async function createEvent(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Tidak dibenarkan' };

    const raw = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        start_at: formData.get('start_at') as string,
        end_at: formData.get('end_at') as string || undefined,
        location: formData.get('location') as string || undefined,
        tags: JSON.parse((formData.get('tags') as string) || '[]'),
        is_published: formData.get('is_published') === 'true',
        max_participants: formData.get('max_participants') ? parseInt(formData.get('max_participants') as string) : null,
    };

    const parsed = createEventSchema.safeParse(raw);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const { error } = await supabase.from('events').insert({
        ...parsed.data,
        mosque_id: DEFAULT_MOSQUE_ID,
        created_by: user.id,
    });

    if (error) return { error: error.message };

    revalidatePath('/events');
    revalidatePath('/admin/events');
    return { error: null };
}

export async function updateEvent(id: string, formData: FormData) {
    const supabase = await createClient();
    const raw = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        start_at: formData.get('start_at') as string,
        end_at: formData.get('end_at') as string || undefined,
        location: formData.get('location') as string || undefined,
        tags: JSON.parse((formData.get('tags') as string) || '[]'),
        is_published: formData.get('is_published') === 'true',
        max_participants: formData.get('max_participants') ? parseInt(formData.get('max_participants') as string) : null,
    };

    const parsed = createEventSchema.safeParse(raw);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { error } = await supabase.from('events').update(parsed.data).eq('id', id);
    if (error) return { error: error.message };

    revalidatePath('/events');
    revalidatePath(`/events/${id}`);
    revalidatePath('/admin/events');
    return { error: null };
}

export async function deleteEvent(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) return { error: error.message };

    revalidatePath('/events');
    revalidatePath('/admin/events');
    return { error: null };
}

export async function rsvpToEvent(eventId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Sila log masuk untuk RSVP' };

    const { error } = await supabase.from('event_rsvps').upsert({
        event_id: eventId,
        user_id: user.id,
        status: 'confirmed',
    }, { onConflict: 'event_id,user_id' });

    if (error) return { error: error.message };

    revalidatePath(`/events/${eventId}`);
    return { error: null };
}

export async function cancelRsvp(eventId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Tidak dibenarkan' };

    const { error } = await supabase
        .from('event_rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

    if (error) return { error: error.message };

    revalidatePath(`/events/${eventId}`);
    return { error: null };
}

export async function getRsvpCount(eventId: string) {
    const supabase = await createClient();
    const { count, error } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

    if (error) return 0;
    return count || 0;
}

export async function getUserRsvp(eventId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

    return data;
}
