'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateUserRole } from '@/actions/roles';
import { Loader2, Check } from 'lucide-react';
import type { UserRole } from '@/lib/types/database';

interface Props {
    userId: string;
    currentRole: UserRole;
    isSelf: boolean;
}

export function UserRoleForm({ userId, currentRole, isSelf }: Props) {
    const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
    const [isPending, startTransition] = useTransition();

    const isDirty = selectedRole !== currentRole;

    const handleSave = () => {
        if (!isDirty) return;

        // Basic client-side warning before self-demotion
        if (isSelf && selectedRole !== 'admin') {
            const confirmDemote = window.confirm(
                'AMARAN: Mengubah peranan anda sendiri akan melucutkan akses Admin anda serta-merta. Pastikan ada pentadbir lain. Teruskan?'
            );
            if (!confirmDemote) {
                setSelectedRole(currentRole);
                return;
            }
        }

        startTransition(async () => {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('role', selectedRole);

            const result = await updateUserRole(formData);

            if (result?.error) {
                toast.error(result.error);
                setSelectedRole(currentRole); // revert UI
            } else {
                toast.success('Peranan berjaya dikemaskini.');
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Select
                value={selectedRole}
                onValueChange={(val) => setSelectedRole(val as UserRole)}
                disabled={isPending}
            >
                <SelectTrigger className="w-[110px] sm:w-[130px] h-8 text-xs sm:text-sm">
                    <SelectValue placeholder="Peranan" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="student">Pelajar</SelectItem>
                    <SelectItem value="member">Kariah / Ahli</SelectItem>
                    <SelectItem value="staff">Staf Masjid</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
            </Select>

            {isDirty && (
                <Button
                    size="sm"
                    variant="default"
                    className="h-8 w-8 p-0 shrink-0 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30"
                    onClick={handleSave}
                    disabled={isPending}
                    title="Simpan Peranan"
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
            )}
        </div>
    );
}
