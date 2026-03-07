/**
 * Facilities page — mosque facilities directory.
 */
import { getFacilities } from '@/actions/facilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Accessibility } from 'lucide-react';
import { PageViewTracker } from '@/components/page-view-tracker';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kemudahan',
    description: 'Direktori kemudahan Masjid Sultan Ibrahim, UTHM',
};

export default async function FacilitiesPage() {
    const { data: facilities, error } = await getFacilities();

    // Group by category
    const grouped: Record<string, typeof facilities> = {};
    facilities?.forEach((f) => {
        const cat = f.category || 'Lain-lain';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat]!.push(f);
    });

    return (
        <div className="space-y-4">
            <PageViewTracker />
            <div>
                <h1 className="text-xl font-bold">Kemudahan Masjid</h1>
                <p className="text-sm text-muted-foreground">Direktori kemudahan MSI UTHM</p>
            </div>

            {/* Visitor mode button */}
            <Link href="/facilities?mode=visitor" className="block">
                <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/50 transition-colors">
                    <CardContent className="p-3.5 flex items-center gap-3">
                        <span className="text-xl">🧳</span>
                        <div>
                            <p className="font-semibold text-sm">Mode Pelawat / Musafir</p>
                            <p className="text-[10px] text-muted-foreground">Info ringkas untuk tetamu dan musafir</p>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="space-y-2">
                    <h2 className="text-xs uppercase tracking-wider font-medium text-muted-foreground">{category}</h2>
                    <div className="space-y-2">
                        {items?.map((facility) => (
                            <Card key={facility.id} className="border-border/50 hover:bg-accent/30 transition-colors">
                                <CardContent className="p-3.5">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2 shrink-0">
                                            <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-sm">{facility.name}</h3>
                                                {facility.has_wheelchair_access && (
                                                    <Accessibility className="h-3.5 w-3.5 text-blue-500" />
                                                )}
                                            </div>
                                            {facility.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">{facility.description}</p>
                                            )}
                                            {facility.location_hint && (
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <MapPin className="h-3 w-3" /> {facility.location_hint}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
