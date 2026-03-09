'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

import { type UserRole } from '@/lib/types/database';

const ROLES = ['student', 'member', 'staff', 'moderator', 'admin'] as const;

const updateRoleSchema = z.object({
    userId: z.string().uuid('ID pengguna tidak sah'),
    role: z.enum(['student', 'member', 'staff', 'moderator', 'admin'], {
        message: 'Peranan tidak sah'
    })
});

export async function updateUserRole(formData: FormData) {
    try {
        const supabase = await createClient();

        // 1. Verify caller is an Admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'Sila log masuk' };

        const { data: callerProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (callerProfile?.role !== 'admin') {
            return { error: 'Akses ditolak. Anda bukan admin.' };
        }

        // 2. Validate input
        const rawData = {
            userId: formData.get('userId'),
            role: formData.get('role')
        };

        const validated = updateRoleSchema.safeParse(rawData);
        if (!validated.success) {
            return { error: validated.error.issues[0]?.message || 'Input tidak sah' };
        }

        const { userId, role } = validated.data;

        // 3. Prevent self-demotion from Admin
        if (userId === user.id && role !== 'admin') {
            // Check if there are other admins before allowing demotion
            const { count } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'admin');

            if ((count || 0) <= 1) {
                return { error: 'Anda tidak boleh membuang satu-satunya Admin yang tinggal.' };
            }
        }

        // 4. Update the profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ role, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (updateError) {
            console.error("Role update error:", updateError);
            return { error: 'Gagal mengemaskini peranan pengguna.' };
        }

        revalidatePath('/admin/users');
        return { success: true };

    } catch (err: any) {
        console.error("updateUserRole error:", err);
        return { error: 'Ralat pelayan memproses permintaan.' };
    }
}
