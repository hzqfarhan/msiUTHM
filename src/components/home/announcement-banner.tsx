/**
 * Announcement Banner — glass morphism latest announcement.
 */
import Link from 'next/link';
import { Megaphone } from 'lucide-react';
import type { Announcement } from '@/lib/types/database';

interface Props {
    announcement: Announcement;
}

const categoryColors: Record<string, string> = {
    urgent: 'text-red-400 bg-red-500/10',
    general: 'text-secondary bg-secondary/10',
    event: 'text-navy dark:text-primary bg-primary/10',
    facilities: 'text-amber-400 bg-amber-500/10',
};

export function AnnouncementBanner({ announcement }: Props) {
    return (
        <Link
            href="/announcements"
            className="block rounded-2xl glass-card glass-shimmer p-4 hover:scale-[1.01] transition-all duration-300"
        >
            <div className="flex items-start gap-3">
                <div className={`rounded-xl p-2 shrink-0 ${categoryColors[announcement.category] || categoryColors.general}`}>
                    <Megaphone className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className={`glass-badge ${announcement.category === 'urgent' ? 'text-red-400' : 'text-muted-foreground'}`}>
                            {announcement.category === 'urgent' ? 'Segera' : 'Pengumuman'}
                        </span>
                        {announcement.pinned && (
                            <span className="text-[10px] text-muted-foreground">📌</span>
                        )}
                    </div>
                    <p className="text-sm font-medium leading-tight line-clamp-2">{announcement.title}</p>
                    {announcement.body && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{announcement.body}</p>
                    )}
                </div>
            </div>
        </Link>
    );
}
