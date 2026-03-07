/**
 * Admin Announcements page — list + create.
 */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { createAnnouncement, deleteAnnouncement } from '@/actions/announcements';
import { ANNOUNCEMENT_CATEGORIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { Announcement } from '@/lib/types/database';

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                if (data) setAnnouncements(data as Announcement[]);
            });
    }, []);

    const handleCreate = async (formData: FormData) => {
        setLoading(true);
        try {
            const result = await createAnnouncement(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Pengumuman ditambah!');
                setOpen(false);
                router.refresh();
                // Reload list
                const supabase = createClient();
                const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
                if (data) setAnnouncements(data as Announcement[]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Padam pengumuman ini?')) return;
        const result = await deleteAnnouncement(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            setAnnouncements((prev) => prev.filter((a) => a.id !== id));
            toast.success('Dipadam');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm">Urus Pengumuman</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="mr-1 h-3 w-3" /> Tambah
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Pengumuman Baru</DialogTitle>
                        </DialogHeader>
                        <form action={handleCreate} className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="title" className="text-xs">Tajuk</Label>
                                <Input id="title" name="title" required className="text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="body" className="text-xs">Isi</Label>
                                <Textarea id="body" name="body" rows={3} className="text-sm resize-none" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Kategori</Label>
                                <Select name="category" defaultValue="general">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ANNOUNCEMENT_CATEGORIES.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="pinned" value="true" id="pinned" className="accent-emerald-600" />
                                <Label htmlFor="pinned" className="text-xs cursor-pointer">Pin di atas</Label>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                {loading ? 'Menyimpan...' : 'Terbitkan'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-2">
                {announcements.map((a) => (
                    <Card key={a.id} className="border-border/50">
                        <CardContent className="p-3.5 flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-sm truncate">{a.title}</h3>
                                    <Badge variant="secondary" className="text-[10px] h-4">{a.category}</Badge>
                                    {a.pinned && <span className="text-[10px]">📌</span>}
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    {new Date(a.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', timeZone: 'Asia/Kuala_Lumpur' })}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(a.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
