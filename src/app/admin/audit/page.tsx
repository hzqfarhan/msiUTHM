/**
 * Admin Audit Log Page — view all admin changes.
 * Glass morphism styling.
 */
import { createClient } from '@/lib/supabase/server';
import { Shield, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = { title: 'Log Audit' };

const actionLabels: Record<string, string> = {
    INSERT: 'Tambah',
    UPDATE: 'Kemaskini',
    DELETE: 'Padam',
};

const tableLabels: Record<string, string> = {
    events: 'Program',
    announcements: 'Pengumuman',
    facilities: 'Kemudahan',
};

export default async function AuditLogPage() {
    const supabase = await createClient();

    const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="h-8 text-xs glass-button rounded-xl border-0">
                    <Link href="/admin">
                        <ArrowLeft className="mr-1 h-3 w-3" /> Panel Admin
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-500" /> Log Audit
                </h1>
                <p className="text-sm text-muted-foreground">Jejak semua perubahan oleh admin.</p>
            </div>

            <div className="space-y-2">
                {logs && logs.length > 0 ? (
                    logs.map((log: any) => {
                        const createdAt = new Date(log.created_at);
                        const timeStr = createdAt.toLocaleString('ms-MY', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Asia/Kuala_Lumpur',
                        });
                        const actionColor =
                            log.action === 'INSERT' ? 'text-emerald-500' :
                                log.action === 'DELETE' ? 'text-red-500' :
                                    'text-amber-500';

                        return (
                            <div key={log.id} className="glass-card rounded-xl p-3 flex items-start gap-3">
                                <div className={`glass-badge ${actionColor} mt-0.5`}>
                                    {actionLabels[log.action] || log.action}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">
                                        {tableLabels[log.entity_table] || log.entity_table}
                                    </p>
                                    {log.after_data?.title && (
                                        <p className="text-xs text-muted-foreground truncate">
                                            &quot;{log.after_data.title || log.before_data?.title}&quot;
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                                    <Clock className="h-3 w-3" /> {timeStr}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="glass-card rounded-xl p-6 text-center">
                        <p className="text-sm text-muted-foreground">Tiada log audit.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
