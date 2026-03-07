/**
 * Server actions for feedback reports.
 */
'use server';

import { createClient } from '@/lib/supabase/server';
import { feedbackSchema } from '@/lib/validators/feedback';
import { DEFAULT_MOSQUE_ID } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

export async function submitFeedback(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const raw = {
        category: formData.get('category') as string,
        description: formData.get('description') as string,
        facility_id: formData.get('facility_id') as string || null,
    };

    const parsed = feedbackSchema.safeParse(raw);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    // Handle photo upload if present
    let photo_url: string | null = null;
    const photo = formData.get('photo') as File | null;
    if (photo && photo.size > 0) {
        const ext = photo.name.split('.').pop();
        const fileName = `feedback/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(fileName, photo, { contentType: photo.type });

        if (!uploadError) {
            const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
            photo_url = urlData.publicUrl;
        }
    }

    const { error } = await supabase.from('feedback_reports').insert({
        ...parsed.data,
        mosque_id: DEFAULT_MOSQUE_ID,
        user_id: user?.id || null,
        photo_url,
    });

    if (error) return { error: error.message };

    revalidatePath('/admin/feedback');
    return { error: null, success: true };
}

export async function updateFeedbackStatus(id: string, status: string, adminNotes?: string) {
    const supabase = await createClient();

    const updates: { status: string; admin_notes?: string } = { status };
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;

    const { error } = await supabase
        .from('feedback_reports')
        .update(updates)
        .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/admin/feedback');
    return { error: null };
}

export async function getAllFeedback() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('feedback_reports')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return { error: error.message, data: null };
    return { data, error: null };
}
