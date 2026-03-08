'use client';

/**
 * Admin layout — sidebar navigation + role guard.
 * Middleware already handles auth check, this provides the admin UI shell.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Calendar,
    Megaphone,
    Building2,
    Clock,
    MessageSquare,
    BarChart3,
    Users,
    Home,
    ArrowLeft,
    ShieldCheck,
    Heart,
    Menu,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNav = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/events', label: 'Program', icon: Calendar },
    { href: '/admin/announcements', label: 'Pengumuman', icon: Megaphone },
    { href: '/admin/facilities', label: 'Kemudahan', icon: Building2 },
    { href: '/admin/prayer-settings', label: 'Waktu Solat', icon: Clock },
    { href: '/admin/feedback', label: 'Maklum Balas', icon: MessageSquare },
    { href: '/admin/volunteers', label: 'Sukarelawan', icon: Users },
    { href: '/admin/donations', label: 'Sumbangan', icon: Heart }, // Added Sumbangan
    { href: '/admin/analytics', label: 'Analitik', icon: BarChart3 },
    { href: '/admin/verification', label: 'Pengesahan', icon: ShieldCheck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Close mobile drawer on navigation
    useEffect(() => {
        setDrawerOpen(false);
    }, [pathname]);

    // Lock body scroll when mobile drawer open
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    return (
        <div className="min-h-screen flex flex-col lg:flex-row relative z-10">
            {/* Desktop Sidebar (Admin) */}
            <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[14rem] glass-heavy border-r border-[var(--glass-border-subtle)] z-40">
                <div className="flex items-center gap-4 h-16 border-b border-[var(--glass-border-subtle)] px-4 shrink-0">
                    <Link href="/" title="Kembali ke Aplikasi" className="h-9 w-9 flex items-center justify-center rounded-xl glass-button text-muted-foreground hover:text-foreground shrink-0 border-0">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">Panel Admin</p>
                        <p className="text-[10px] text-muted-foreground truncate">MSI UTHM</p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
                    {adminNav.map(item => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch={true}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                                    isActive
                                        ? 'glass-button glow-emerald text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/8'
                                )}
                            >
                                <item.icon className={cn('h-[18px] w-[18px]', isActive && 'stroke-[2.5]')} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Mobile Header (Admin) */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-14 glass-nav z-40 flex items-center justify-between px-4 border-b border-[var(--glass-border-subtle)]">
                <div className="flex items-center gap-3">
                    <button onClick={() => setDrawerOpen(true)} className="h-9 w-9 flex items-center justify-center rounded-xl glass-button border-0">
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm leading-tight">Panel Admin</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">MSI UTHM</span>
                    </div>
                </div>
                <Link href="/" className="h-9 w-9 flex items-center justify-center rounded-xl glass-button text-muted-foreground hover:text-foreground border-0">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </header>

            {/* Mobile Drawer (Admin) */}
            <div
                className={cn(
                    'fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
                    drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={() => setDrawerOpen(false)}
            />

            <nav
                className={cn(
                    'fixed top-0 left-0 bottom-0 z-[70] w-[280px] glass-heavy border-r border-[var(--glass-border)] flex flex-col transition-transform duration-300 ease-out lg:hidden',
                    drawerOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--glass-border-subtle)] shrink-0">
                    <p className="font-bold text-sm">Menu Admin</p>
                    <button onClick={() => setDrawerOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-xl glass-button border-0">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
                    {adminNav.map(item => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch={true}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                                    isActive
                                        ? 'glass-button glow-emerald text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/8'
                                )}
                            >
                                <item.icon className={cn('h-[18px] w-[18px]', isActive && 'stroke-[2.5]')} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Main Content Area */}
            {/* The root layout (`src/app/layout.tsx`) applies `sidebar-content-offset` globally which adds `pl-14rem` or 224px. */}
            <main className="flex-1 pt-16 lg:pt-0 min-h-screen">
                <div className="p-4 lg:p-8 w-full space-y-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
