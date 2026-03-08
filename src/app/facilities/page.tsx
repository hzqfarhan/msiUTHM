/**
 * Facilities page — mosque facilities directory.
 */
import { getFacilities } from '@/actions/facilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Accessibility } from 'lucide-react';
import { PageViewTracker } from '@/components/page-view-tracker';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kemudahan',
    description: 'Direktori kemudahan Masjid Sultan Ibrahim, UTHM',
};

export const revalidate = 300; // 5 minutes ISR

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
                <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items?.map((facility) => (
                            <Link key={facility.id} href={`/facilities?highlight=${facility.id}`} className="block h-full group">
                                <Card className="h-full flex flex-col hover:bg-accent/50 transition-colors border-border/50 overflow-hidden relative p-3">
                                    {/* Top Image Section */}
                                    <div className="relative w-full aspect-video bg-secondary/5 rounded-lg overflow-hidden shrink-0">
                                        {facility.image_url ? (
                                            <Image
                                                src={facility.image_url}
                                                alt={facility.name}
                                                fill
                                                className="object-cover transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-secondary/40">
                                                <Building2 className="h-12 w-12 mb-2 opacity-50" />
                                                <span className="text-[10px] font-medium uppercase tracking-wider">Tiada Gambar</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <CardContent className="p-2 pt-4 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <h3 className="font-semibold text-[15px] leading-snug group-hover:text-primary transition-colors">
                                                {facility.name}
                                            </h3>
                                            {facility.has_wheelchair_access && (
                                                <div className="p-1.5 bg-secondary/10 rounded-full shrink-0" title="Mesra OKU">
                                                    <Accessibility className="h-4 w-4 text-secondary" />
                                                </div>
                                            )}
                                        </div>

                                        {facility.description && (
                                            <p className="text-[11px] text-muted-foreground mb-4 flex-1">
                                                {facility.description}
                                            </p>
                                        )}

                                        {/* Spacer */}
                                        <div className="flex-1" />

                                        {/* Footer Row */}
                                        {(facility.location_hint || facility.category) && (
                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50 text-[11px] text-muted-foreground">
                                                {facility.location_hint ? (
                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                        <MapPin className="h-3 w-3 shrink-0 text-primary/60" />
                                                        <span className="truncate">{facility.location_hint}</span>
                                                    </div>
                                                ) : <span />}

                                                {facility.category && (
                                                    <Badge variant="outline" className="text-[9px] bg-background">
                                                        {facility.category}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
