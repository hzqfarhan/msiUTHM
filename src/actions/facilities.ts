/**
 * Server actions for facilities.
 */
'use server';

import { createClient } from '@/lib/supabase/server';
import { DEFAULT_MOSQUE_ID } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

export async function getFacilities() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('mosque_id', DEFAULT_MOSQUE_ID)
        .order('category', { ascending: true });

    if (error) return { error: error.message, data: null };
    return { data, error: null };
}

export async function getFacilityById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return { error: error.message, data: null };
    return { data, error: null };
}

export async function createFacility(formData: FormData) {
    const supabase = await createClient();

    const { error } = await supabase.from('facilities').insert({
        mosque_id: DEFAULT_MOSQUE_ID,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        location_hint: formData.get('location_hint') as string,
        has_wheelchair_access: formData.get('has_wheelchair_access') === 'true',
        opening_hours: formData.get('opening_hours') as string || null,
    });

    if (error) return { error: error.message };

    revalidatePath('/facilities');
    revalidatePath('/admin/facilities');
    return { error: null };
}

export async function updateFacility(id: string, formData: FormData) {
    const supabase = await createClient();

    const { error } = await supabase.from('facilities').update({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        location_hint: formData.get('location_hint') as string,
        has_wheelchair_access: formData.get('has_wheelchair_access') === 'true',
        opening_hours: formData.get('opening_hours') as string || null,
    }).eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/facilities');
    revalidatePath(`/facilities/${id}`);
    revalidatePath('/admin/facilities');
    return { error: null };
}

export async function deleteFacility(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('facilities').delete().eq('id', id);
    if (error) return { error: error.message };

    revalidatePath('/facilities');
    revalidatePath('/admin/facilities');
    return { error: null };
}
