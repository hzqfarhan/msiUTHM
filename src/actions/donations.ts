/**
 * Server actions for Infaq & Sumbangan module.
 */
'use server';

import { createClient } from '@/lib/supabase/server';
import { DEFAULT_MOSQUE_ID } from '@/lib/constants';

export interface DonationSettings {
    id: string;
    mosque_id: string;
    title: string | null;
    intro_text: string | null;
    disclaimer_text: string | null;
    bank_name: string | null;
    account_number: string | null;
    account_name: string | null;
    qr_image_url: string | null;
    notes: string | null;
    contact_name: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    is_active: boolean;
    updated_at: string;
}

export interface DonationMethod {
    id: string;
    mosque_id: string;
    method_type: 'duitnow_qr' | 'bank_transfer' | 'external_link';
    label: string;
    bank_name: string | null;
    account_number: string | null;
    account_name: string | null;
    reference_note: string | null;
    qr_image_url: string | null;
    external_url: string | null;
    is_active: boolean;
    sort_order: number;
}

export interface DonationCampaign {
    id: string;
    mosque_id: string;
    title: string;
    description: string | null;
    target_amount: number | null;
    current_amount: number | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
    sort_order: number;
}

/**
 * Get donation settings (global settings from donation_info table).
 */
export async function getDonationSettings() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('donation_info')
        .select('*')
        .eq('mosque_id', DEFAULT_MOSQUE_ID)
        .single();

    if (error) return { data: null, error: error.message };
    return { data: data as DonationSettings, error: null };
}

/**
 * Get active donation methods.
 */
export async function getDonationMethods() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('donation_methods')
        .select('*')
        .eq('mosque_id', DEFAULT_MOSQUE_ID)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: (data || []) as DonationMethod[], error: null };
}

/**
 * Get active donation campaigns.
 */
export async function getDonationCampaigns() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('donation_campaigns')
        .select('*')
        .eq('mosque_id', DEFAULT_MOSQUE_ID)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: (data || []) as DonationCampaign[], error: null };
}

// ─── Admin Actions ─────────────────────────────────────────

/**
 * Update donation settings (admin only).
 */
export async function updateDonationSettings(settings: Partial<DonationSettings>) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('donation_info')
        .update(settings)
        .eq('mosque_id', DEFAULT_MOSQUE_ID);

    if (error) return { error: error.message };
    return { error: null };
}

/**
 * Get ALL donation methods (including inactive) for admin.
 */
export async function getAdminDonationMethods() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('donation_methods')
        .select('*')
        .eq('mosque_id', DEFAULT_MOSQUE_ID)
        .order('sort_order', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: (data || []) as DonationMethod[], error: null };
}

/**
 * Create a donation method (admin only).
 */
export async function createDonationMethod(method: Omit<DonationMethod, 'id' | 'mosque_id'>) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('donation_methods')
        .insert({ ...method, mosque_id: DEFAULT_MOSQUE_ID })
        .select()
        .single();

    if (error) return { data: null, error: error.message };
    return { data: data as DonationMethod, error: null };
}

/**
 * Update a donation method (admin only).
 */
export async function updateDonationMethod(id: string, updates: Partial<DonationMethod>) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('donation_methods')
        .update(updates)
        .eq('id', id);

    if (error) return { error: error.message };
    return { error: null };
}

/**
 * Delete a donation method (admin only).
 */
export async function deleteDonationMethod(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('donation_methods')
        .delete()
        .eq('id', id);

    if (error) return { error: error.message };
    return { error: null };
}

/**
 * Get ALL campaigns (including inactive) for admin.
 */
export async function getAdminDonationCampaigns() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('donation_campaigns')
        .select('*')
        .eq('mosque_id', DEFAULT_MOSQUE_ID)
        .order('sort_order', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: (data || []) as DonationCampaign[], error: null };
}

/**
 * Create a campaign (admin only).
 */
export async function createDonationCampaign(campaign: Omit<DonationCampaign, 'id' | 'mosque_id'>) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('donation_campaigns')
        .insert({ ...campaign, mosque_id: DEFAULT_MOSQUE_ID })
        .select()
        .single();

    if (error) return { data: null, error: error.message };
    return { data: data as DonationCampaign, error: null };
}

/**
 * Update a campaign (admin only).
 */
export async function updateDonationCampaign(id: string, updates: Partial<DonationCampaign>) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('donation_campaigns')
        .update(updates)
        .eq('id', id);

    if (error) return { error: error.message };
    return { error: null };
}

/**
 * Delete a campaign (admin only).
 */
export async function deleteDonationCampaign(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('donation_campaigns')
        .delete()
        .eq('id', id);

    if (error) return { error: error.message };
    return { error: null };
}
