'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types/database';

/**
 * Shared profile hook — caches at module level so sidebar + header
 * never duplicate the Supabase getUser() + profiles query.
 */
let cachedProfile: Profile | null = null;
let fetchPromise: Promise<Profile | null> | null = null;

async function fetchProfile(): Promise<Profile | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    if (!data) return null;

    const p = data as Profile;

    // Sync Google avatar / name if missing
    const googleAvatar =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        null;
    const googleName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        null;
    const needsUpdate =
        (googleAvatar && !p.avatar_url) ||
        (googleName && !p.full_name);

    if (needsUpdate) {
        const updates: Partial<Profile> = {};
        if (googleAvatar && !p.avatar_url) updates.avatar_url = googleAvatar;
        if (googleName && !p.full_name) updates.full_name = googleName;

        const { data: updated } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        cachedProfile = (updated as Profile) || p;
    } else {
        cachedProfile = p;
    }
    return cachedProfile;
}

export function useProfile() {
    const [profile, setProfile] = useState<Profile | null>(cachedProfile);

    useEffect(() => {
        if (cachedProfile) {
            setProfile(cachedProfile);
            return;
        }
        if (!fetchPromise) fetchPromise = fetchProfile();
        fetchPromise.then(p => setProfile(p));
    }, []);

    return profile;
}
