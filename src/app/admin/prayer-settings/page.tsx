/**
 * Admin Prayer Settings page — manage iqamah offsets.
 */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { updateIqamahSetting } from '@/actions/prayer';
import { PRAYER_DISPLAY } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import type { IqamahSetting } from '@/lib/types/database';

export default function AdminPrayerSettingsPage() {
    const [settings, setSettings] = useState<Record<string, { offset: number; fixed: string }>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from('iqamah_settings')
            .select('*')
            .then(({ data }) => {
                if (data) {
                    const map: Record<string, { offset: number; fixed: string }> = {};
                    (data as IqamahSetting[]).forEach((s) => {
                        map[s.prayer_name] = { offset: s.offset_minutes, fixed: s.fixed_time || '' };
                    });
                    setSettings(map);
                }
            });
    }, []);

    const handleSave = async (prayerName: string) => {
        setLoading(true);
        const s = settings[prayerName];
        try {
            const result = await updateIqamahSetting(
                prayerName,
                s?.offset || 10,
                s?.fixed || null,
            );
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Iqamah ${prayerName} dikemaskini`);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = (prayer: string, field: 'offset' | 'fixed', value: string | number) => {
        setSettings((prev) => ({
            ...prev,
            [prayer]: { ...prev[prayer], [field]: value },
        }));
    };

    // Filter out syuruk (no iqamah for sunrise)
    const prayers = PRAYER_DISPLAY.filter((p) => p.key !== 'syuruk');

    return (
        <div className="space-y-4">
            <div>
                <h2 className="font-semibold text-sm">Tetapan Iqamah</h2>
                <p className="text-xs text-muted-foreground">Tetapkan masa iqamah bagi setiap waktu solat.</p>
            </div>

            <div className="space-y-3">
                {prayers.map((prayer) => {
                    const s = settings[prayer.key] || { offset: 10, fixed: '' };
                    return (
                        <Card key={prayer.key} className="border-border/50">
                            <CardContent className="p-3.5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-sm">{prayer.label} ({prayer.labelEn})</h3>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-[10px]"
                                        onClick={() => handleSave(prayer.key)}
                                        disabled={loading}
                                    >
                                        <Save className="mr-1 h-3 w-3" /> Simpan
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Offset (minit selepas azan)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={60}
                                            value={s.offset}
                                            onChange={(e) => updateSetting(prayer.key, 'offset', parseInt(e.target.value) || 0)}
                                            className="text-sm h-8"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Masa Tetap (pilihan)</Label>
                                        <Input
                                            type="time"
                                            value={s.fixed}
                                            onChange={(e) => updateSetting(prayer.key, 'fixed', e.target.value)}
                                            className="text-sm h-8"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
