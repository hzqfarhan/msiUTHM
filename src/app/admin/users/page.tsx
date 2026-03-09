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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {users?.map((usr, index) => (
                    <Card key={usr.id} className="glass-card border-[var(--glass-border-subtle)] overflow-hidden relative">
                        {/* Number #1 */}
                        <div className="absolute top-2 left-2.5 text-[10px] sm:text-xs font-bold text-muted-foreground/40 pointer-events-none">
                            #{index + 1}
                        </div>
                        <CardContent className="p-3 sm:p-4 mt-2 flex flex-col items-center justify-center text-center gap-3 h-full">

                            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border border-[var(--glass-border)] shrink-0 shadow-sm">
                                <AvatarImage src={usr.avatar_url || ''} alt={usr.full_name || 'Pengguna'} />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                    <UserIcon className="h-5 w-5 opacity-50" />
                                </AvatarFallback>
                            </Avatar>

                            <div className="space-y-0.5 min-w-0 flex flex-col items-center w-full">
                                <div className="flex items-center gap-1.5 max-w-full justify-center flex-wrap">
                                    <p className="font-semibold text-xs sm:text-sm leading-tight truncate px-1 max-w-full">
                                        {usr.full_name || 'Tiada Nama'}
                                    </p>
                                    {usr.id === user.id && (
                                        <Badge variant="outline" className="text-[9px] px-1 h-3.5 border-primary/20 text-primary shrink-0 hidden sm:inline-flex">Anda</Badge>
                                    )}
                                </div>
                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate w-full px-1">
                                    {usr.email || 'Tiada emel'}
                                </p>
                                <div className="text-[9px] text-muted-foreground mt-0.5">
                                    Sertai {new Date(usr.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="w-full mt-auto pt-2.5 border-t border-[var(--glass-border-subtle)] flex justify-center">
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
                    <div className="col-span-full text-center py-12 glass-card rounded-2xl border-[var(--glass-border)]">
                        <UserIcon className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-sm font-medium">Tiada pengguna dijumpai.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
