import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, User as UserIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { UserRoleForm } from './user-role-form';

export const metadata: Metadata = { title: 'Pengurusan Pengguna | Admin' };

export default async function AdminUsersPage() {
    const supabase = await createClient();

    // 1. Ensure Caller is Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return <p>Sila log masuk.</p>;

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (adminProfile?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
                    <ShieldAlert className="h-8 w-8 text-destructive" />
                </div>
                <div>
                    <h2 className="text-lg font-bold">Akses Ditolak</h2>
                    <p className="text-sm text-muted-foreground mt-1">Anda tidak mempunyai kebenaran untuk melihat halaman ini.</p>
                </div>
            </div>
        );
    }

    // 2. Fetch Users
    const { data: users, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url, created_at, provider')
        .order('created_at', { ascending: false });

    if (error) {
        return <p className="text-destructive text-sm p-4">Gagal memuat pengguna: {error.message}</p>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Pengurusan Pengguna</h1>
                <p className="text-sm text-muted-foreground">Kawal peranan dan akses pengguna aplikasi.</p>
            </div>

            <div className="grid gap-3">
                {users?.map((usr) => (
                    <Card key={usr.id} className="glass-card border-[var(--glass-border-subtle)] overflow-hidden">
                        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">

                            <div className="flex items-center gap-4 min-w-0">
                                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border border-[var(--glass-border)] shrink-0">
                                    <AvatarImage src={usr.avatar_url || ''} alt={usr.full_name || 'Pengguna'} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                        <UserIcon className="h-5 w-5 opacity-50" />
                                    </AvatarFallback>
                                </Avatar>

                                <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm sm:text-base leading-tight truncate">
                                            {usr.full_name || 'Tiada Nama'}
                                        </p>
                                        {usr.id === user.id && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 h-4 border-primary/20 text-primary hidden sm:inline-flex">Anda</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate hidden sm:block">
                                        {usr.email || 'Tiada emel'}
                                        {usr.provider && ` • via ${usr.provider}`}
                                    </p>
                                    <div className="sm:hidden text-[10px] text-muted-foreground mt-0.5">
                                        Diperoleh pada {new Date(usr.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0">
                                {/* The Client Component for role updates */}
                                <UserRoleForm
                                    userId={usr.id}
                                    currentRole={usr.role}
                                    isSelf={usr.id === user.id}
                                />
                            </div>

                        </CardContent>
                    </Card>
                ))}

                {(!users || users.length === 0) && (
                    <div className="text-center py-12 glass-card rounded-2xl border-[var(--glass-border)]">
                        <UserIcon className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-sm font-medium">Tiada pengguna dijumpai.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
