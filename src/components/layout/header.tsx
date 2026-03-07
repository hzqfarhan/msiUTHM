/**
 * App Header — mobile/tablet only (hidden on desktop where sidebar takes over).
 * Liquid glass styling with Hijri date.
 */
'use client';

import Link from 'next/link';
import { Moon, Sun, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/actions/auth';
import { getHijriDate } from '@/lib/hijri';
import type { Profile } from '@/lib/types/database';

export function Header() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [dark, setDark] = useState(false);
    const [hijriDate, setHijriDate] = useState('');

    useEffect(() => {
        // Theme
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = stored === 'dark' || (!stored && prefersDark);
        setDark(isDark);
        document.documentElement.classList.toggle('dark', isDark);

        // Hijri
        setHijriDate(getHijriDate());

        // User
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                    .then(({ data }) => {
                        if (data) setProfile(data as Profile);
                    });
            }
        });
    }, []);

    const toggleTheme = () => {
        const newDark = !dark;
        setDark(newDark);
        document.documentElement.classList.toggle('dark', newDark);
        localStorage.setItem('theme', newDark ? 'dark' : 'light');
    };

    return (
        <header className="sticky top-0 z-50 glass-nav glass-shimmer lg:hidden">
            <div className="mx-auto flex h-14 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2.5">
                    <img
                        src="/bg/app-logo.png"
                        alt="MSI UTHM Logo"
                        className="h-8 w-8 object-contain"
                    />
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-sm leading-tight">MSI UTHM</span>
                        {hijriDate && (
                            <span className="text-[9px] text-muted-foreground leading-tight">{hijriDate}</span>
                        )}
                    </div>
                </Link>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 glass-button rounded-xl border-0">
                        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>

                    {profile ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={profile.avatar_url || ''} />
                                        <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                            {(profile.full_name || 'U')[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 glass-heavy rounded-xl">
                                <div className="px-2 py-1.5 text-sm font-medium truncate">
                                    {profile.full_name || 'Pengguna'}
                                </div>
                                <DropdownMenuSeparator />
                                {profile.role === 'admin' && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin" className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" /> Panel Admin
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                    <form action={signOut} className="w-full">
                                        <button type="submit" className="flex w-full items-center gap-2">
                                            <LogOut className="h-4 w-4" /> Log Keluar
                                        </button>
                                    </form>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button variant="ghost" size="sm" asChild className="h-9 glass-button rounded-xl border-0">
                            <Link href="/auth/login">
                                <User className="mr-1 h-4 w-4" /> Log Masuk
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
