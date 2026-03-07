/**
 * Floating pill navigation bar — visible on both mobile and desktop.
 * Liquid glass styling with collapsible labels.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock, Calendar, Megaphone, Compass, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navItems = [
    { href: '/', label: 'Utama', icon: Home },
    { href: '/prayer', label: 'Solat', icon: Clock },
    { href: '/events', label: 'Program', icon: Calendar },
    { href: '/announcements', label: 'Berita', icon: Megaphone },
    { href: '/qibla', label: 'Kiblat', icon: Compass },
];

export function BottomNav() {
    const pathname = usePathname();
    const [expanded, setExpanded] = useState(true);

    // Auto-collapse on scroll down for mobile
    useEffect(() => {
        let lastScroll = 0;
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            if (currentScroll > lastScroll && currentScroll > 100) {
                setExpanded(false);
            } else if (currentScroll < lastScroll) {
                setExpanded(true);
            }
            lastScroll = currentScroll;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hide on admin pages
    if (pathname.startsWith('/admin')) return null;

    return (
        <nav
            className={cn(
                'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
                'glass-heavy rounded-2xl',
                'shadow-lg shadow-black/10',
                'transition-all duration-300 ease-out',
                'border border-[var(--glass-border)]',
                expanded ? 'px-2 py-1.5' : 'px-1.5 py-1',
            )}
        >
            <div className="flex items-center gap-0.5">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-1.5 rounded-xl transition-all duration-200',
                                expanded ? 'px-3 py-2' : 'px-2.5 py-2',
                                isActive
                                    ? 'glass-button glow-emerald text-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-white/10',
                            )}
                        >
                            <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'stroke-[2.5]')} />
                            {expanded && (
                                <span className={cn(
                                    'text-[10px] font-medium whitespace-nowrap',
                                    'hidden sm:inline',
                                )}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}

                {/* Collapse toggle */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center justify-center h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all ml-0.5"
                    aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'}
                >
                    {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                </button>
            </div>
        </nav>
    );
}
