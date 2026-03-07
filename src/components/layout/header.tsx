/**
 * App Header — floating glass bar with auto-hide on scroll.
 * Visible on all screen sizes.
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
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/actions/auth';
import { getHijriDate } from '@/lib/hijri';
import type { Profile } from '@/lib/types/database';
import { cn } from '@/lib/utils';

export function Header() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [dark, setDark] = useState(false);
    const [hijriDate, setHijriDate] = useState('');
    const [visible, setVisible] = useState(true);
    const lastScrollRef = useRef(0);

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

        // Auto-hide on scroll
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            if (currentScroll > lastScrollRef.current && currentScroll > 80) {
                setVisible(false);
            } else {
                setVisible(true);
            }
            lastScrollRef.current = currentScroll;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        const newDark = !dark;
        setDark(newDark);
        document.documentElement.classList.toggle('dark', newDark);
        localStorage.setItem('theme', newDark ? 'dark' : 'light');
    };

    return (
        <header
            className={cn(
                'fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-screen-lg',
                'glass-heavy rounded-2xl',
                'shadow-lg shadow-black/10',
                'border border-[var(--glass-border)]',
                'transition-all duration-300 ease-out',
                visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none',
            )}
        >
            <div className="flex h-12 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2.5">
                    <img
                        src="/bg/app-logo.png"
                        alt="MSI UTHM Logo"
                        className="h-7 w-7 object-contain"
                    />
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-sm leading-tight">MSI UTHM</span>
                        {hijriDate && (
                            <span className="text-[9px] text-muted-foreground leading-tight hidden sm:block">{hijriDate}</span>
                        )}
                    </div>
                </Link>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 glass-button rounded-xl border-0">
                        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>

                    {profile ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={profile.avatar_url || ''} />
                                        <AvatarFallback className="text-xs bg-primary/20 text-primary">
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
                        <Button variant="ghost" size="sm" asChild className="h-8 glass-button rounded-xl border-0 text-xs">
                            <Link href="/auth/login">
                                <User className="mr-1 h-3.5 w-3.5" /> Log Masuk
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
