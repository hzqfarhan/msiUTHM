/**
 * Sidebar navigation — visible on desktop (lg:), collapsible.
 * Uses liquid glass styling.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, Clock, Calendar, Megaphone, Building2,
    Heart, MessageSquare, Users, Compass, Info,
    Shield, ChevronLeft, ChevronRight,
    LogOut, Moon, Sun, User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/actions/auth';
import { getHijriDate } from '@/lib/hijri';
import type { Profile } from '@/lib/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
    { href: '/', label: 'Utama', icon: Home },
    { href: '/prayer', label: 'Solat', icon: Clock },
    { href: '/events', label: 'Program', icon: Calendar },
    { href: '/announcements', label: 'Berita', icon: Megaphone },
    { href: '/facilities', label: 'Kemudahan', icon: Building2 },
    { href: '/qibla', label: 'Kiblat', icon: Compass },
    { href: '/about', label: 'Info Masjid', icon: Info },
    { href: '/donate', label: 'Infaq', icon: Heart },
    { href: '/feedback', label: 'Lapor Isu', icon: MessageSquare },
    { href: '/volunteer', label: 'Sukarelawan', icon: Users },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [dark, setDark] = useState(false);
    const [hijriDate, setHijriDate] = useState('');

    useEffect(() => {
        // Collapse state
        const stored = localStorage.getItem('sidebar-collapsed');
        if (stored === 'true') setCollapsed(true);

        // Theme
        const themeStored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = themeStored === 'dark' || (!themeStored && prefersDark);
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

    const toggleCollapse = () => {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem('sidebar-collapsed', String(next));
    };

    const toggleTheme = () => {
        const newDark = !dark;
        setDark(newDark);
        document.documentElement.classList.toggle('dark', newDark);
        localStorage.setItem('theme', newDark ? 'dark' : 'light');
    };

    // Hide on admin pages
    if (pathname.startsWith('/admin')) return null;

    return (
        <aside
            className={cn(
                'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40',
                'glass-nav glass-scroll overflow-y-auto overflow-x-hidden',
                'sidebar-transition border-r border-[var(--glass-border-subtle)]',
                collapsed ? 'w-18' : 'w-60'
            )}
        >
            {/* Logo area */}
            <div className={cn(
                'flex items-center gap-3 px-4 h-16 border-b border-[var(--glass-border-subtle)]',
                collapsed && 'justify-center px-2'
            )}>
                <img
                    src="/bg/app-logo.png"
                    alt="MSI UTHM Logo"
                    className={cn("h-9 w-9 shrink-0 object-contain", collapsed && "mx-auto")}
                />
                {!collapsed && (
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm text-foreground truncate">MSI UTHM</span>
                        {hijriDate && (
                            <span className="text-[10px] text-muted-foreground truncate">{hijriDate}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 px-2 space-y-0.5">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.label : undefined}
                            className={cn(
                                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                collapsed && 'justify-center px-2',
                                isActive
                                    ? 'glass-button glow-emerald text-emerald-500 dark:text-emerald-400'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-[var(--glass-bg)]',
                            )}
                        >
                            <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'stroke-[2.5]')} />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div className="mt-auto border-t border-[var(--glass-border-subtle)] p-2 space-y-1">
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className={cn(
                        'flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[var(--glass-bg)] transition-all',
                        collapsed && 'justify-center px-2',
                    )}
                >
                    {dark ? <Sun className="h-[18px] w-[18px] shrink-0" /> : <Moon className="h-[18px] w-[18px] shrink-0" />}
                    {!collapsed && <span>{dark ? 'Mod Cerah' : 'Mod Gelap'}</span>}
                </button>

                {/* Admin link */}
                {profile?.role === 'admin' && (
                    <Link
                        href="/admin"
                        className={cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[var(--glass-bg)] transition-all',
                            collapsed && 'justify-center px-2',
                        )}
                    >
                        <Shield className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && <span>Panel Admin</span>}
                    </Link>
                )}

                {/* User section */}
                {profile ? (
                    <div className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2',
                        collapsed && 'justify-center px-2',
                    )}>
                        <Avatar className="h-7 w-7 shrink-0">
                            <AvatarImage src={profile.avatar_url || ''} />
                            <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                {(profile.full_name || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{profile.full_name || 'Pengguna'}</p>
                                <form action={signOut}>
                                    <button type="submit" className="text-[10px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                                        <LogOut className="h-3 w-3" /> Log Keluar
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link
                        href="/auth/login"
                        className={cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[var(--glass-bg)] transition-all',
                            collapsed && 'justify-center px-2',
                        )}
                    >
                        <User className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && <span>Log Masuk</span>}
                    </Link>
                )}

                {/* Collapse toggle */}
                <button
                    onClick={toggleCollapse}
                    className={cn(
                        'flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[var(--glass-bg)] transition-all',
                        collapsed && 'justify-center px-2',
                    )}
                >
                    {collapsed
                        ? <ChevronRight className="h-[18px] w-[18px] shrink-0" />
                        : <ChevronLeft className="h-[18px] w-[18px] shrink-0" />
                    }
                    {!collapsed && <span>Tutup</span>}
                </button>
            </div>
        </aside>
    );
}
