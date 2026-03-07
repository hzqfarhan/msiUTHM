/**
 * Server actions for volunteers.
 */
'use server';

import { createClient } from '@/lib/supabase/server';
import { DEFAULT_MOSQUE_ID } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

export async function getVolunteerOpportunities() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('volunteer_opportunities')
        .select('*')
        .eq('is_active', true)
        .order('deadline', { ascending: true });

    if (error) return { error: error.message, data: null };
    return { data, error: null };
}

export async function signUpVolunteer(opportunityId: string, message?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Sila log masuk untuk mendaftar' };

    const { error } = await supabase.from('volunteer_signups').insert({
        opportunity_id: opportunityId,
        user_id: user.id,
        message: message || null,
    });

    if (error) {
        if (error.code === '23505') return { error: 'Anda sudah mendaftar' };
        return { error: error.message };
    }

    revalidatePath('/volunteer');
    return { error: null };
}

export async function createVolunteerOpportunity(formData: FormData) {
    const supabase = await createClient();

    const { error } = await supabase.from('volunteer_opportunities').insert({
        mosque_id: DEFAULT_MOSQUE_ID,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        slots_needed: formData.get('slots_needed') ? parseInt(formData.get('slots_needed') as string) : null,
        deadline: formData.get('deadline') as string || null,
        event_id: formData.get('event_id') as string || null,
    });

    if (error) return { error: error.message };

    revalidatePath('/volunteer');
    revalidatePath('/admin/volunteers');
    return { error: null };
}
