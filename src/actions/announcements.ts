/**
 * Server actions for announcements.
 */
'use server';

import { createClient } from '@/lib/supabase/server';
import { createAnnouncementSchema } from '@/lib/validators/announcement';
import { DEFAULT_MOSQUE_ID } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

export async function getAnnouncements() {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // Lazy-publish: show published OR (scheduled AND publish_at <= now)
    // Also exclude expired announcements
    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .or(`status.eq.published,and(status.eq.scheduled,publish_at.lte.${now})`)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) return { error: error.message, data: null };
    return { data, error: null };
}

export async function createAnnouncement(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Tidak dibenarkan' };

    const raw = {
        title: formData.get('title') as string,
        body: formData.get('body') as string,
        category: formData.get('category') as string || 'general',
        is_published: formData.get('is_published') !== 'false',
        pinned: formData.get('pinned') === 'true',
    };

    const parsed = createAnnouncementSchema.safeParse(raw);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { error } = await supabase.from('announcements').insert({
        ...parsed.data,
        mosque_id: DEFAULT_MOSQUE_ID,
        created_by: user.id,
    });

    if (error) return { error: error.message };

    revalidatePath('/announcements');
    revalidatePath('/');
    revalidatePath('/admin/announcements');
    return { error: null };
}

export async function updateAnnouncement(id: string, formData: FormData) {
    const supabase = await createClient();
    const raw = {
        title: formData.get('title') as string,
        body: formData.get('body') as string,
        category: formData.get('category') as string || 'general',
        is_published: formData.get('is_published') !== 'false',
        pinned: formData.get('pinned') === 'true',
    };

    const parsed = createAnnouncementSchema.safeParse(raw);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { error } = await supabase.from('announcements').update(parsed.data).eq('id', id);
    if (error) return { error: error.message };

    revalidatePath('/announcements');
    revalidatePath('/');
    revalidatePath('/admin/announcements');
    return { error: null };
}

export async function deleteAnnouncement(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) return { error: error.message };

    revalidatePath('/announcements');
    revalidatePath('/');
    revalidatePath('/admin/announcements');
    return { error: null };
}
