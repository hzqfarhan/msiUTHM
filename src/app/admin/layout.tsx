/**
 * Admin layout — sidebar navigation + role guard.
 * Middleware already handles auth check, this provides the admin UI shell.
 */
import Link from 'next/link';
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
} from 'lucide-react';

const adminNav = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/events', label: 'Program', icon: Calendar },
    { href: '/admin/announcements', label: 'Pengumuman', icon: Megaphone },
    { href: '/admin/facilities', label: 'Kemudahan', icon: Building2 },
    { href: '/admin/prayer-settings', label: 'Waktu Solat', icon: Clock },
    { href: '/admin/feedback', label: 'Maklum Balas', icon: MessageSquare },
    { href: '/admin/volunteers', label: 'Sukarelawan', icon: Users },
    { href: '/admin/analytics', label: 'Analitik', icon: BarChart3 },
    { href: '/admin/verification', label: 'Pengesahan', icon: ShieldCheck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            {/* Mobile top nav for admin */}
            <div className="border-b border-border/40 bg-card/50 -mx-4 -mt-4 px-4 pt-3 pb-2 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <h1 className="font-bold text-sm">Panel Admin</h1>
                    </div>
                </div>
                <nav className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                    {adminNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border border-border/50 bg-background hover:bg-accent/50 transition-colors"
                        >
                            <item.icon className="h-3.5 w-3.5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {children}
        </div>
    );
}
