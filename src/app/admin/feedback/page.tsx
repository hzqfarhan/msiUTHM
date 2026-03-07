/**
 * Admin Feedback page — moderation view.
 */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { updateFeedbackStatus } from '@/actions/feedback';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, Eye, Clock } from 'lucide-react';
import type { FeedbackReport } from '@/lib/types/database';

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    new: { label: 'Baru', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: Clock },
    acknowledged: { label: 'Disemak', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', icon: Eye },
    resolved: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300', icon: CheckCircle },
};

export default function AdminFeedbackPage() {
    const [reports, setReports] = useState<FeedbackReport[]>([]);

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from('feedback_reports')
            .select('*')
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                if (data) setReports(data as FeedbackReport[]);
            });
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        const result = await updateFeedbackStatus(id, newStatus);
        if (result.error) {
            toast.error(result.error);
        } else {
            setReports((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: newStatus as FeedbackReport['status'] } : r)),
            );
            toast.success('Status dikemaskini');
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="font-semibold text-sm">Maklum Balas & Laporan</h2>

            {!reports.length && (
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground text-sm">
                        Tiada maklum balas.
                    </CardContent>
                </Card>
            )}

            <div className="space-y-2">
                {reports.map((r) => {
                    const config = statusConfig[r.status] || statusConfig.new;
                    return (
                        <Card key={r.id} className="border-border/50">
                            <CardContent className="p-3.5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className={`text-[10px] h-4 px-1.5 ${config.color}`}>
                                            {config.label}
                                        </Badge>
                                        <Badge variant="outline" className="text-[10px] h-4">
                                            {r.category}
                                        </Badge>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">
                                        {new Date(r.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', timeZone: 'Asia/Kuala_Lumpur' })}
                                    </span>
                                </div>

                                <p className="text-sm">{r.description}</p>

                                {r.photo_url && (
                                    <img src={r.photo_url} alt="Lampiran" className="w-full max-w-xs rounded-lg border" />
                                )}

                                <div className="flex gap-1.5 pt-1">
                                    {r.status === 'new' && (
                                        <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleStatusUpdate(r.id, 'acknowledged')}>
                                            <Eye className="mr-1 h-3 w-3" /> Semak
                                        </Button>
                                    )}
                                    {r.status !== 'resolved' && (
                                        <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleStatusUpdate(r.id, 'resolved')}>
                                            <CheckCircle className="mr-1 h-3 w-3" /> Selesai
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
