/**
 * Collapsible sidebar navigation — desktop (lg+).
 * Styled like the reference: icon+label rows, section headers, user info at bottom.
 * Mobile uses the floating bottom-nav instead.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, Clock, Calendar, Megaphone, Building2,
    Heart, MessageSquare, Users, Compass, Info,
    Shield, ChevronLeft, ChevronRight,
    LogOut, Moon, Sun, User, MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/actions/auth';
import type { Profile } from '@/lib/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const mainNav = [
    { href: '/', label: 'Utama', icon: Home },
    { href: '/prayer', label: 'Waktu Solat', icon: Clock },
    { href: '/events', label: 'Program', icon: Calendar },
    { href: '/announcements', label: 'Berita', icon: Megaphone },
    { href: '/facilities', label: 'Kemudahan', icon: Building2 },
    { href: '/qibla', label: 'Kiblat', icon: Compass },
];

const infoNav = [
    { href: '/about', label: 'Info Masjid', icon: Info },
    { href: '/donate', label: 'Infaq', icon: Heart },
    { href: '/feedback', label: 'Lapor Isu', icon: MessageSquare },
    { href: '/volunteer', label: 'Sukarelawan', icon: Users },
];

function NavItem({ href, label, icon: Icon, collapsed, pathname }: {
    href: string; label: string; icon: React.ElementType; collapsed: boolean; pathname: string;
}) {
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
    return (
        <Link
            href={href}
            title={collapsed ? label : undefined}
            className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative',
                collapsed && 'justify-center px-0 mx-2',
                isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/8',
            )}
        >
            <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'stroke-[2.5]')} />
            {!collapsed && <span className="truncate">{label}</span>}
            {/* Active indicator line */}
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary" />
            )}
        </Link>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [dark, setDark] = useState(false);

    useEffect(() => {
        // Restore collapsed state
        const stored = localStorage.getItem('sidebar-collapsed');
        const isCollapsed = stored === 'true';
        if (isCollapsed) setCollapsed(true);
        document.body.dataset.sidebarCollapsed = String(isCollapsed);

        // Theme
        const themeStored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = themeStored === 'dark' || (!themeStored && prefersDark);
        setDark(isDark);
        document.documentElement.classList.toggle('dark', isDark);

        // User profile
        const supabase = createClient();
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) return;

            // First fetch existing profile
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (existingProfile) {
                // If avatar_url is missing but Google metadata has one, update it
                const googleAvatar =
                    user.user_metadata?.avatar_url ||
                    user.user_metadata?.picture ||
                    null;
                const googleName =
                    user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    null;

                const needsUpdate =
                    (googleAvatar && !existingProfile.avatar_url) ||
                    (googleName && !existingProfile.full_name);

                if (needsUpdate) {
                    const updates: Partial<Profile> = {};
                    if (googleAvatar && !existingProfile.avatar_url) updates.avatar_url = googleAvatar;
                    if (googleName && !existingProfile.full_name) updates.full_name = googleName;

                    const { data: updated } = await supabase
                        .from('profiles')
                        .update(updates)
                        .eq('id', user.id)
                        .select()
                        .single();

                    setProfile((updated as Profile) || existingProfile as Profile);
                } else {
                    setProfile(existingProfile as Profile);
                }
            }
        });
    }, []);

    const toggleCollapse = () => {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem('sidebar-collapsed', String(next));
        document.body.dataset.sidebarCollapsed = String(next);
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
                'bg-background/80 dark:bg-background/90',
                'backdrop-filter backdrop-blur-xl',
                'border-r border-border/40',
                'transition-all duration-300 ease-in-out',
                collapsed ? 'w-[64px]' : 'w-[240px]',
            )}
        >
            {/* Logo */}
            <div className={cn(
                'flex items-center gap-3 h-16 border-b border-border/40 px-4 shrink-0',
                collapsed && 'justify-center px-0',
            )}>
                <img
                    src="/bg/app-logo.png"
                    alt="MSI UTHM"
                    className="h-8 w-8 shrink-0 object-contain"
                />
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">MSI UTHM</p>
                        <p className="text-[10px] text-muted-foreground truncate">Companion App</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5 scrollbar-hide">
                {/* Main nav */}
                <div className={cn('px-2 space-y-0.5', collapsed && 'px-0')}>
                    {!collapsed && (
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 pt-1 pb-1.5">
                            Menu
                        </p>
                    )}
                    {mainNav.map(item => (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            icon={item.icon}
                            collapsed={collapsed}
                            pathname={pathname}
                        />
                    ))}
                </div>

                <div className={cn('px-2 pt-3 space-y-0.5', collapsed && 'px-0')}>
                    {!collapsed && (
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 pt-1 pb-1.5">
                            Info & Komuniti
                        </p>
                    )}
                    {infoNav.map(item => (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            icon={item.icon}
                            collapsed={collapsed}
                            pathname={pathname}
                        />
                    ))}
                </div>
            </nav>

            {/* Bottom section */}
            <div className="shrink-0 border-t border-border/40 py-2 space-y-0.5">
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    title={collapsed ? (dark ? 'Mod Cerah' : 'Mod Gelap') : undefined}
                    className={cn(
                        'flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all mx-2',
                        collapsed && 'justify-center w-auto mx-2 px-0',
                    )}
                >
                    {dark ? <Sun className="h-[18px] w-[18px] shrink-0" /> : <Moon className="h-[18px] w-[18px] shrink-0" />}
                    {!collapsed && <span>{dark ? 'Mod Cerah' : 'Mod Gelap'}</span>}
                </button>

                {/* Admin link */}
                {profile?.role === 'admin' && (
                    <Link
                        href="/admin"
                        title={collapsed ? 'Panel Admin' : undefined}
                        className={cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all mx-2',
                            collapsed && 'justify-center w-auto mx-2 px-0',
                        )}
                    >
                        <Shield className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && <span>Panel Admin</span>}
                    </Link>
                )}

                {/* User profile row */}
                <div className={cn(
                    'flex items-center gap-3 px-3 py-2 mx-2',
                    collapsed && 'justify-center mx-2 px-0',
                )}>
                    {profile ? (
                        <>
                            <Avatar className="h-7 w-7 shrink-0 ring-2 ring-primary/20">
                                <AvatarImage src={profile.avatar_url || ''} />
                                <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold">
                                    {(profile.full_name || 'U')[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {!collapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold truncate">{profile.full_name || 'Pengguna'}</p>
                                    <form action={signOut}>
                                        <button type="submit" className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                                            <LogOut className="h-3 w-3" /> Log Keluar
                                        </button>
                                    </form>
                                </div>
                            )}
                        </>
                    ) : (
                        <Link
                            href="/auth/login"
                            title={collapsed ? 'Log Masuk' : undefined}
                            className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <User className="h-7 w-7 shrink-0 p-1.5 rounded-full bg-muted" />
                            {!collapsed && <span>Log Masuk</span>}
                        </Link>
                    )}
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={toggleCollapse}
                    title={collapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
                    className={cn(
                        'flex items-center gap-3 w-full rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all mx-2',
                        collapsed && 'justify-center w-auto mx-2 px-0',
                    )}
                >
                    {collapsed
                        ? <ChevronRight className="h-4 w-4 shrink-0" />
                        : <><ChevronLeft className="h-4 w-4 shrink-0" /><span>Tutup</span></>
                    }
                </button>
            </div>
        </aside>
    );
}
