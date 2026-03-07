/**
 * Announcements page — list of mosque announcements.
 */
import { getAnnouncements } from '@/actions/announcements';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone } from 'lucide-react';
import { PageViewTracker } from '@/components/page-view-tracker';
import { AnnouncementShareButton } from '@/components/announcements/share-button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pengumuman',
    description: 'Pengumuman terkini Masjid Sultan Ibrahim, UTHM',
};

const categoryLabels: Record<string, string> = {
    general: 'Umum',
    urgent: 'Segera',
    event: 'Acara',
    facilities: 'Kemudahan',
};

const categoryColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    general: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    event: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    facilities: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

export default async function AnnouncementsPage() {
    const { data: announcements, error } = await getAnnouncements();

    return (
        <div className="space-y-4">
            <PageViewTracker />
            <div>
                <h1 className="text-xl font-bold">Pengumuman</h1>
                <p className="text-sm text-muted-foreground">Berita dan pengumuman terkini MSI</p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {!announcements?.length && !error && (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Tiada pengumuman</p>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-3">
                {announcements?.map((a) => (
                    <Card key={a.id} className="border-border/50">
                        <CardContent className="p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className={`text-[10px] h-4 px-1.5 ${categoryColors[a.category] || categoryColors.general}`}>
                                    {categoryLabels[a.category] || a.category}
                                </Badge>
                                {a.pinned && <span className="text-[10px]">📌</span>}
                                <span className="text-[10px] text-muted-foreground ml-auto">
                                    {new Date(a.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', timeZone: 'Asia/Kuala_Lumpur' })}
                                </span>
                                <AnnouncementShareButton title={a.title} body={a.body} />
                            </div>
                            <h3 className="font-semibold text-sm">{a.title}</h3>
                            {a.body && (
                                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{a.body}</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
