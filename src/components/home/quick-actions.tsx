/**
 * Quick Actions Grid ΓÇö liquid glass pill-style buttons.
 */
import Link from 'next/link';
import {
    Clock, Calendar, Building2, Heart, MessageSquare, Users, Compass, Info, BookOpen,
} from 'lucide-react';

const actions = [
    { href: '/qibla', label: 'Kiblat', icon: Compass, variant: 'liquid-btn-teal', iconColor: 'text-primary' },
    { href: '/quran', label: 'Al-Quran', icon: BookOpen, variant: 'liquid-btn-gold', iconColor: 'text-primary' },
    { href: '/prayer', label: 'Waktu Solat', icon: Clock, variant: 'liquid-btn-emerald', iconColor: 'text-primary' },
    { href: '/events', label: 'Program', icon: Calendar, variant: 'liquid-btn-blue', iconColor: 'text-secondary' },
    { href: '/facilities', label: 'Kemudahan', icon: Building2, variant: 'liquid-btn-purple', iconColor: 'text-secondary' },
    { href: '/donate', label: 'Infaq', icon: Heart, variant: 'liquid-btn-rose', iconColor: 'text-rose-400' },
    { href: '/feedback', label: 'Lapor Isu', icon: MessageSquare, variant: 'liquid-btn-orange', iconColor: 'text-amber-400' },
    { href: '/volunteer', label: 'Sukarelawan', icon: Users, variant: 'liquid-btn-teal', iconColor: 'text-primary' },
];

export function QuickActions() {
    return (
        <div>
            <h2 className="text-xs uppercase tracking-wider font-medium text-muted-foreground mb-3">
                Akses Pantas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {actions.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className={`liquid-btn ${action.variant} flex-col gap-2 py-4 px-3 text-xs`}
                    >
                        <div className="rounded-full p-2 bg-white/5">
                            <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                        </div>
                        <span className="font-medium text-center leading-tight">{action.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
