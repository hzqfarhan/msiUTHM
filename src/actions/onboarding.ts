'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const onboardingSchema = z.object({
    full_name: z.string().min(2, 'Nama penuh diperlukan'),
    community_role: z.enum(['student', 'staff', 'alumni', 'community']),
    phone: z.string().optional().nullable(),
    faculty: z.string().optional().nullable(),
    batch: z.string().optional().nullable(),
    volunteering_interests: z.array(z.string()).optional(),
    notification_preferences: z.record(z.string(), z.boolean()).optional(),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

export async function completeOnboarding(data: OnboardingData) {
    try {
        const validated = onboardingSchema.parse(data);
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: 'Sesi anda telah tamat. Sila log masuk semula.' };
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: validated.full_name,
                community_role: validated.community_role,
                phone: validated.phone || null,
                faculty: validated.faculty || null,
                batch: validated.batch || null,
                volunteering_interests: validated.volunteering_interests || [],
                notification_preferences: validated.notification_preferences || {},
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (error) {
            console.error('Onboarding update error:', error);
            return { error: 'Gagal mengemaskini profil. Sila cuba lagi.' };
        }

        return { success: true };
    } catch (err: any) {
        if (err instanceof z.ZodError || (err && err.errors)) {
            return { error: err.errors[0]?.message || 'Input tidak sah' };
        }
        return { error: 'Ralat sistem berlaku. Sila cuba lagi.' };
    }
}
