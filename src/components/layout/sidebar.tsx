/**
 * Collapsible sidebar navigation — desktop (lg+).
 * Styled like the reference: icon+label rows, section headers, user info at bottom.
 * Mobile uses the hamburger drawer from header.tsx instead.
 */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    Home, Clock, Calendar, Megaphone, Building2,
    Heart, MessageSquare, Users, Compass, Info,
    Shield, ChevronLeft, ChevronRight,
    LogOut, Moon, Sun, User, BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { signOut } from '@/actions/auth';
import { useProfile } from '@/hooks/use-profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const mainNav = [
    { href: '/', label: 'Utama', icon: Home },
    { href: '/prayer', label: 'Waktu Solat', icon: Clock },
    { href: '/quran', label: 'Al-Quran', icon: BookOpen },
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
            prefetch={true}
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
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary" />
            )}
        </Link>
    );
}

function getRoleBadgeProps(role: string | null | undefined) {
    switch (role) {
        case 'admin': return { label: 'Admin', className: 'bg-amber-500/20 text-amber-500 dark:bg-amber-400/20 dark:text-amber-400' };
        case 'moderator': return { label: 'Mod', className: 'bg-orange-500/20 text-orange-600 dark:bg-orange-400/20 dark:text-orange-400' };
        case 'staff': return { label: 'Staf', className: 'bg-blue-500/20 text-blue-600 dark:bg-blue-400/20 dark:text-blue-400' };
        case 'student': return { label: 'Pelajar', className: 'bg-slate-500/20 text-slate-600 dark:bg-slate-400/20 dark:text-slate-400' };
        default: return { label: 'Member', className: 'bg-primary/15 text-primary' };
    }
}

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const profile = useProfile();
    const [collapsed, setCollapsed] = useState(false);
    const [dark, setDark] = useState(false);

    useEffect(() => {
        // Restore collapsed state
        const stored = localStorage.getItem('sidebar-collapsed');
        const isCollapsed = stored === 'true';
        // eslint-disable-next-line react-hooks/exhaustive-deps
        if (isCollapsed) setCollapsed(true);
        document.body.dataset.sidebarCollapsed = String(isCollapsed);

        // Theme
        const themeStored = localStorage.getItem('theme');
        // Default to light mode for all users unless explicitly toggled to dark
        const isDark = themeStored === 'dark';
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setDark(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    const toggleCollapse = () => {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem('sidebar-collapsed', String(next));
        document.body.dataset.sidebarCollapsed = String(next);
    };

    const toggleTheme = () => {
        if (!profile) {
            toast.error('Sila log masuk untuk menukar tema gelap.');
            router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }
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
                'glass-heavy',
                'border-r border-[var(--glass-border-subtle)]',
                'transition-all duration-300 ease-in-out',
                collapsed ? 'w-16' : 'w-56',
            )}
        >
            {/* Logo */}
            <div className={cn(
                'flex items-center h-14 border-b border-[var(--glass-border-subtle)] shrink-0',
                collapsed ? 'justify-center px-0' : 'gap-3 px-4',
            )}>
                <Image
                    src="/bg/app-logo.png"
                    alt="MSI UTHM"
                    width={32}
                    height={32}
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

            {/* Bottom section — same px-2/px-0 pattern as nav for alignment */}
            <div className={cn(
                'shrink-0 border-t border-[var(--glass-border-subtle)] py-2 space-y-0.5',
                collapsed ? 'px-0' : 'px-2',
            )}>
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    title={collapsed ? (dark ? 'Mod Cerah' : 'Mod Gelap') : undefined}
                    className={cn(
                        'flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all',
                        collapsed && 'justify-center px-0 mx-2',
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
                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all',
                            collapsed && 'justify-center px-0 mx-2',
                        )}
                    >
                        <Shield className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && <span>Panel Admin</span>}
                    </Link>
                )}

                {/* User profile row */}
                <div className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl',
                    collapsed && 'justify-center px-0 mx-2',
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
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-semibold truncate">{profile.full_name || 'Pengguna'}</p>
                                        {(() => {
                                            const badgeInfo = getRoleBadgeProps(profile.role);
                                            return (
                                                <span className={cn(
                                                    'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full leading-none shrink-0',
                                                    badgeInfo.className
                                                )}>
                                                    {badgeInfo.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
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
                        'flex items-center gap-3 w-full rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all',
                        collapsed && 'justify-center px-0 mx-2',
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
