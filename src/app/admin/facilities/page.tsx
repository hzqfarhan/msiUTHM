/**
 * Admin Facilities page.
 */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Accessibility } from 'lucide-react';
import { createFacility, deleteFacility } from '@/actions/facilities';
import { FACILITY_CATEGORIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { Facility } from '@/lib/types/database';

export default function AdminFacilitiesPage() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        supabase.from('facilities').select('*').order('category').then(({ data }) => {
            if (data) setFacilities(data as Facility[]);
        });
    }, []);

    const handleCreate = async (formData: FormData) => {
        setLoading(true);
        try {
            const result = await createFacility(formData);
            if (result.error) toast.error(result.error);
            else {
                toast.success('Kemudahan ditambah!');
                setOpen(false);
                router.refresh();
                const supabase = createClient();
                const { data } = await supabase.from('facilities').select('*').order('category');
                if (data) setFacilities(data as Facility[]);
            }
        } finally { setLoading(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Padam kemudahan ini?')) return;
        const result = await deleteFacility(id);
        if (result.error) toast.error(result.error);
        else {
            setFacilities((prev) => prev.filter((f) => f.id !== id));
            toast.success('Dipadam');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm">Urus Kemudahan</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="mr-1 h-3 w-3" /> Tambah
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                        <DialogHeader><DialogTitle>Kemudahan Baru</DialogTitle></DialogHeader>
                        <form action={handleCreate} className="space-y-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Nama</Label>
                                <Input name="name" required className="text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Penerangan</Label>
                                <Textarea name="description" rows={2} className="text-sm resize-none" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Kategori</Label>
                                <Select name="category">
                                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                    <SelectContent>
                                        {FACILITY_CATEGORIES.map((c) => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Petunjuk Lokasi</Label>
                                <Input name="location_hint" className="text-sm" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="has_wheelchair_access" value="true" id="wheelchair" className="accent-emerald-600" />
                                <Label htmlFor="wheelchair" className="text-xs">Akses OKU</Label>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                {loading ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-2">
                {facilities.map((f) => (
                    <Card key={f.id} className="border-border/50">
                        <CardContent className="p-3.5 flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-sm truncate">{f.name}</h3>
                                    {f.has_wheelchair_access && <Accessibility className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                                </div>
                                <p className="text-[10px] text-muted-foreground">{f.category}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(f.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
