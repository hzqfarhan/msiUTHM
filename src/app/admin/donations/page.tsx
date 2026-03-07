import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Urus Sumbangan' };

export default async function AdminDonationsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Pengurusan Sumbangan</h2>
                    <p className="text-sm text-muted-foreground">Pusat kawalan untuk maklumat infaq dan sumbangan.</p>
                </div>
            </div>

            <Card className="glass-card border-[var(--glass-border-subtle)] bg-transparent">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Heart className="h-5 w-5 text-rose-500" />
                        Tetapan Maklumat Infaq
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                        <div className="p-4 rounded-full bg-rose-500/10 mb-2">
                            <Heart className="h-8 w-8 text-rose-500" />
                        </div>
                        <h3 className="font-semibold text-lg">Modul Sedang Dibangunkan</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            Sistem pengurusan sumbangan sedang dinaik taraf. Buat masa ini, maklumat bank dikemas kini secara terus melalui pangkalan data.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
