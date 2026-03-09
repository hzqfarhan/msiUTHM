/**
 * Mobile header with hamburger menu drawer.
 * Slides out from left, same nav items as desktop sidebar.
 */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    Home, Clock, Calendar, Megaphone, Building2,
    Heart, MessageSquare, Users, Compass, Info,
    Shield, LogOut, Moon, Sun, User, Menu, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState, useCallback } from 'react';
import { signOut } from '@/actions/auth';
import { getHijriDate } from '@/lib/hijri';
import { useProfile } from '@/hooks/use-profile';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const profile = useProfile();
    const [dark, setDark] = useState(false);
    const [hijriDate, setHijriDate] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('theme');
        // Default to light mode for all users unless explicitly toggled to dark
        const isDark = stored === 'dark';
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setDark(isDark);
        document.documentElement.classList.toggle('dark', isDark);

        // eslint-disable-next-line react-hooks/exhaustive-deps
        setHijriDate(getHijriDate());
    }, []);

    // Close drawer on route change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { setDrawerOpen(false); }, [pathname]);

    // Lock body scroll when drawer open
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    const toggleTheme = useCallback(() => {
        if (!profile) {
            toast.error('Sila log masuk untuk menukar tema gelap.');
            router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }
        setDark(prev => {
            const newDark = !prev;
            document.documentElement.classList.toggle('dark', newDark);
            localStorage.setItem('theme', newDark ? 'dark' : 'light');
            return newDark;
        });
    }, [profile, router, pathname]);

    if (pathname.startsWith('/admin')) return null;

    return (
        <>
            {/* Top bar */}
            <header className="fixed top-0 left-0 right-0 z-50 h-14 glass-nav">
                <div className="flex h-full items-center justify-between px-4">
                    {/* Left: hamburger + logo */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setDrawerOpen(true)}
                            className="flex items-center justify-center h-9 w-9 rounded-xl glass-button border-0"
                            aria-label="Buka menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/bg/app-logo.png" alt="MSI UTHM" width={28} height={28} className="h-7 w-7 object-contain" />
                            <div className="flex flex-col">
                                <span className="font-bold text-foreground text-sm leading-tight">MSI UTHM</span>
                                {hijriDate && (
                                    <span className="text-[9px] text-muted-foreground leading-tight">{hijriDate}</span>
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Right: role badge + theme + profile */}
                    <div className="flex items-center gap-1.5">
                        {/* Role badge */}
                        {profile && (
                            <span className={cn(
                                'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full leading-none',
                                profile.role === 'admin'
                                    ? 'bg-amber-500/20 text-amber-500 dark:bg-amber-400/20 dark:text-amber-400'
                                    : 'bg-primary/15 text-primary',
                            )}>
                                {profile.role === 'admin' ? 'Admin' : 'Member'}
                            </span>
                        )}
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 rounded-xl">
                            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>
                        {profile ? (
                            <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                                <AvatarImage src={profile.avatar_url || ''} />
                                <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold">
                                    {(profile.full_name || 'U')[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        ) : (
                            <Button variant="ghost" size="sm" asChild className="h-8 rounded-xl text-xs">
                                <Link href="/auth/login">
                                    <User className="mr-1 h-3.5 w-3.5" /> Log Masuk
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Backdrop overlay */}
            <div
                className={cn(
                    'fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300',
                    drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
                )}
                onClick={() => setDrawerOpen(false)}
            />

            {/* Side drawer */}
            <nav
                className={cn(
                    'fixed top-0 left-0 bottom-0 z-[70] w-[280px]',
                    'glass-heavy border-r border-[var(--glass-border)]',
                    'flex flex-col',
                    'transition-transform duration-300 ease-out',
                    drawerOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between h-14 px-4 border-b border-border/30 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <Image src="/bg/app-logo.png" alt="MSI UTHM" width={32} height={32} className="h-8 w-8 object-contain" />
                        <div>
                            <p className="text-sm font-bold text-foreground">MSI UTHM</p>
                            <p className="text-[10px] text-muted-foreground">Companion App</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setDrawerOpen(false)}
                        className="h-8 w-8 flex items-center justify-center rounded-xl glass-button border-0"
                        aria-label="Tutup menu"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* User info — glass card */}
                {profile && (
                    <div className="mx-3 mt-3 p-3 rounded-xl glass-card">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                                <AvatarImage src={profile.avatar_url || ''} />
                                <AvatarFallback className="text-sm bg-primary/20 text-primary font-bold">
                                    {(profile.full_name || 'U')[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate">{profile.full_name || 'Pengguna'}</p>
                                <p className="text-[10px] text-muted-foreground">Selamat datang 👋</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav items */}
                <div className="flex-1 overflow-y-auto py-3 space-y-1 px-2 scrollbar-hide">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 pb-1">
                        Menu
                    </p>
                    {mainNav.map(item => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch={true}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all relative',
                                    isActive
                                        ? 'glass-button glow-emerald text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/8',
                                )}
                            >
                                <item.icon className={cn('h-[18px] w-[18px]', isActive && 'stroke-[2.5]')} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 pt-3 pb-1">
                        Info & Komuniti
                    </p>
                    {infoNav.map(item => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch={true}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all relative',
                                    isActive
                                        ? 'glass-button glow-emerald text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/8',
                                )}
                            >
                                <item.icon className={cn('h-[18px] w-[18px]', isActive && 'stroke-[2.5]')} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom */}
                <div className="shrink-0 border-t border-border/30 p-2 space-y-0.5">
                    {profile?.role === 'admin' && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/8"
                        >
                            <Shield className="h-[18px] w-[18px]" />
                            <span>Panel Admin</span>
                        </Link>
                    )}
                    {profile && (
                        <form action={signOut}>
                            <button
                                type="submit"
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-all"
                            >
                                <LogOut className="h-[18px] w-[18px]" />
                                <span>Log Keluar</span>
                            </button>
                        </form>
                    )}
                </div>
            </nav>
        </>
    );
}
