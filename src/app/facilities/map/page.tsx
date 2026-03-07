/**
 * Facility Map Page — shows a static mosque map with clickable pins.
 * Glass morphism styling.
 */
'use client';

import { useState, useEffect } from 'react';
import { MapPin, X, Accessibility, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Facility {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    location_hint: string | null;
    has_wheelchair_access: boolean;
}

// Default pin positions (percentage-based on a map image)
// In production, these would come from the database
const defaultPins: { facilityName: string; x: number; y: number; color: string }[] = [
    { facilityName: 'Dewan Solat Utama (Muslimin)', x: 50, y: 35, color: '#00C6C8' },
    { facilityName: 'Dewan Solat Muslimat', x: 50, y: 55, color: '#00C6C8' },
    { facilityName: 'Tandas Lelaki', x: 25, y: 70, color: '#4F8FB5' },
    { facilityName: 'Tandas Wanita', x: 75, y: 70, color: '#4F8FB5' },
    { facilityName: 'Tempat Wuduk Lelaki', x: 20, y: 60, color: '#4FE0E3' },
    { facilityName: 'Tempat Wuduk Wanita', x: 80, y: 60, color: '#4FE0E3' },
    { facilityName: 'Tempat Letak Kereta', x: 50, y: 90, color: '#0B1E4A' },
    { facilityName: 'Ruang Rehat Musafir', x: 85, y: 40, color: '#0FA3A6' },
];

export default function FacilityMapPage() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from('facilities')
            .select('*')
            .order('name')
            .then(({ data }) => {
                if (data) setFacilities(data as Facility[]);
            });
    }, []);

    const handlePinClick = (facilityName: string) => {
        const found = facilities.find(f => f.name === facilityName);
        if (found) setSelectedFacility(found);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="h-8 text-xs glass-button rounded-xl border-0">
                    <Link href="/facilities">
                        <ChevronLeft className="mr-1 h-3 w-3" /> Senarai Fasiliti
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className="text-xl font-bold">Peta Masjid</h1>
                <p className="text-sm text-muted-foreground">Tekan pin untuk melihat maklumat kemudahan</p>
            </div>

            {/* Map container */}
            <div className="glass-card glass-shimmer rounded-2xl p-4 relative">
                {/* Map placeholder — a stylized mosque layout */}
                <div className="relative aspect-[4/3] bg-gradient-to-b from-primary/10 to-accent/10 rounded-xl overflow-hidden border border-[var(--glass-border-subtle)]">
                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    />

                    {/* Mosque outline */}
                    <div className="absolute top-[15%] left-[20%] right-[20%] bottom-[20%] border-2 border-primary/30 rounded-xl">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-primary glass-badge">
                            Bangunan Utama
                        </div>
                    </div>

                    {/* Pins */}
                    {defaultPins.map((pin, i) => (
                        <button
                            key={i}
                            onClick={() => handlePinClick(pin.facilityName)}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
                            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                            title={pin.facilityName}
                        >
                            <div
                                className="relative flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 group-hover:scale-125"
                                style={{
                                    backgroundColor: `${pin.color}20`,
                                    boxShadow: `0 0 12px ${pin.color}40`,
                                }}
                            >
                                <MapPin className="h-4 w-4" style={{ color: pin.color }} />
                                <div
                                    className="absolute inset-0 rounded-full animate-ping opacity-30"
                                    style={{ backgroundColor: pin.color }}
                                />
                            </div>
                            <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity glass-badge">
                                {pin.facilityName}
                            </span>
                        </button>
                    ))}

                    {/* Legend */}
                    <div className="absolute bottom-2 left-2 glass-heavy rounded-lg p-2 text-[8px] space-y-0.5">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> Solat</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-secondary" /> Tandas</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-accent" /> Wuduk</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-navy" /> Tempat Letak Kereta</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary-dark" /> Rehat</div>
                    </div>
                </div>
            </div>

            {/* Selected facility detail */}
            {selectedFacility && (
                <div className="glass-card glass-shimmer rounded-2xl p-4 space-y-2 glow-emerald">
                    <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-sm">{selectedFacility.name}</h3>
                        <button onClick={() => setSelectedFacility(null)} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    {selectedFacility.category && (
                        <span className="glass-badge text-[10px]">{selectedFacility.category}</span>
                    )}
                    {selectedFacility.description && (
                        <p className="text-xs text-muted-foreground">{selectedFacility.description}</p>
                    )}
                    {selectedFacility.location_hint && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {selectedFacility.location_hint}
                        </p>
                    )}
                    {selectedFacility.has_wheelchair_access && (
                        <p className="text-xs flex items-center gap-1 text-primary">
                            <Accessibility className="h-3 w-3" /> Mesra OKU
                        </p>
                    )}
                    <Button variant="outline" size="sm" asChild className="glass-button rounded-xl text-xs w-full">
                        <Link href={`/feedback?facility_id=${selectedFacility.id}`}>
                            Lapor Isu
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
