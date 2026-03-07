/**
 * Bottom navigation bar — mobile/tablet only, hidden on desktop (lg:).
 * Liquid glass styling.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock, Calendar, Megaphone, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Utama', icon: Home },
    { href: '/prayer', label: 'Solat', icon: Clock },
    { href: '/events', label: 'Program', icon: Calendar },
    { href: '/announcements', label: 'Berita', icon: Megaphone },
    { href: '/qibla', label: 'Kiblat', icon: Compass },
];

export function BottomNav() {
    const pathname = usePathname();

    // Hide on admin pages and desktop
    if (pathname.startsWith('/admin')) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav safe-bottom lg:hidden">
            <div className="mx-auto flex items-center justify-around py-1.5">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-all duration-200 rounded-xl',
                                isActive
                                    ? 'text-emerald-500 dark:text-emerald-400'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <div className={cn(
                                'flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-200',
                                isActive && 'glass-button glow-emerald',
                            )}>
                                <item.icon className={cn('h-[18px] w-[18px]', isActive && 'stroke-[2.5]')} />
                            </div>
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
