/**
 * Admin Volunteers page.
 */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users } from 'lucide-react';
import { createVolunteerOpportunity } from '@/actions/volunteer';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface VolOpp {
    id: string; title: string; description: string | null; slots_needed: number | null;
    deadline: string | null; is_active: boolean; signups?: { count: number }[];
}

export default function AdminVolunteersPage() {
    const [opportunities, setOpportunities] = useState<VolOpp[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from('volunteer_opportunities')
            .select('*, signups:volunteer_signups(count)')
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                if (data) setOpportunities(data as unknown as VolOpp[]);
            });
    }, []);

    const handleCreate = async (formData: FormData) => {
        setLoading(true);
        try {
            const result = await createVolunteerOpportunity(formData);
            if (result.error) toast.error(result.error);
            else {
                toast.success('Peluang sukarelawan ditambah!');
                setOpen(false);
                router.refresh();
            }
        } finally { setLoading(false); }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm">Urus Sukarelawan</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="mr-1 h-3 w-3" /> Tambah
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                        <DialogHeader><DialogTitle>Peluang Sukarelawan Baru</DialogTitle></DialogHeader>
                        <form action={handleCreate} className="space-y-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Tajuk</Label>
                                <Input name="title" required className="text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Penerangan</Label>
                                <Textarea name="description" rows={2} className="text-sm resize-none" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Slot Diperlukan</Label>
                                <Input name="slots_needed" type="number" min={1} className="text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Tarikh Akhir</Label>
                                <Input name="deadline" type="datetime-local" className="text-sm" />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                {loading ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-2">
                {opportunities.map((opp) => (
                    <Card key={opp.id} className="border-border/50">
                        <CardContent className="p-3.5">
                            <h3 className="font-medium text-sm">{opp.title}</h3>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {opp.signups?.[0]?.count || 0}{opp.slots_needed ? ` / ${opp.slots_needed} slot` : ' pendaftar'}
                                </span>
                                {opp.deadline && (
                                    <span>
                                        Tamat: {new Date(opp.deadline).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', timeZone: 'Asia/Kuala_Lumpur' })}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
