/**
 * Volunteer signup button — client component.
 */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { signUpVolunteer } from '@/actions/volunteer';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Hand } from 'lucide-react';

interface Props {
    opportunityId: string;
}

export function VolunteerSignupButton({ opportunityId }: Props) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async () => {
        setLoading(true);
        try {
            const result = await signUpVolunteer(opportunityId);
            if (result.error) {
                if (result.error.includes('log masuk')) {
                    router.push(`/auth/login?redirect=/volunteer`);
                    return;
                }
                toast.error(result.error);
            } else {
                toast.success('Pendaftaran berjaya! 🎉');
                router.refresh();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleSignup}
            disabled={loading}
            size="sm"
            className="shrink-0 h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white"
        >
            <Hand className="mr-1 h-3 w-3" />
            {loading ? '...' : 'Daftar'}
        </Button>
    );
}
