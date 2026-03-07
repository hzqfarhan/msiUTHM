/**
 * Admin event edit/create page.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createEvent, updateEvent, getEventById } from '@/actions/events';
import { EVENT_TAGS } from '@/lib/constants';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminEventEditPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;
    const isNew = eventId === 'new';

    const [loading, setLoading] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isPublished, setIsPublished] = useState(false);

    // Load existing event data
    useEffect(() => {
        if (!isNew) {
            getEventById(eventId).then(({ data }) => {
                if (data) {
                    setSelectedTags(data.tags || []);
                    setIsPublished(data.is_published);
                    // Populate form fields
                    const form = document.querySelector('form');
                    if (form) {
                        (form.querySelector('#title') as HTMLInputElement).value = data.title;
                        (form.querySelector('#description') as HTMLTextAreaElement).value = data.description || '';
                        (form.querySelector('#start_at') as HTMLInputElement).value = data.start_at.slice(0, 16);
                        (form.querySelector('#end_at') as HTMLInputElement).value = data.end_at?.slice(0, 16) || '';
                        (form.querySelector('#location') as HTMLInputElement).value = data.location || '';
                        (form.querySelector('#max_participants') as HTMLInputElement).value = data.max_participants?.toString() || '';
                    }
                }
            });
        }
    }, [eventId, isNew]);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        formData.set('tags', JSON.stringify(selectedTags));
        formData.set('is_published', String(isPublished));

        try {
            const result = isNew
                ? await createEvent(formData)
                : await updateEvent(eventId, formData);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(isNew ? 'Program berjaya ditambah!' : 'Program dikemaskini!');
                router.push('/admin/events');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
        );
    };

    return (
        <div className="space-y-4">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
                <Link href="/admin/events">
                    <ArrowLeft className="mr-1 h-3 w-3" /> Senarai Program
                </Link>
            </Button>

            <h2 className="font-semibold text-sm">{isNew ? 'Tambah Program' : 'Edit Program'}</h2>

            <Card className="border-border/50">
                <CardContent className="p-4">
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="title" className="text-xs">Tajuk</Label>
                            <Input id="title" name="title" required className="text-sm" />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-xs">Penerangan</Label>
                            <Textarea id="description" name="description" rows={4} className="text-sm resize-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="start_at" className="text-xs">Mula</Label>
                                <Input id="start_at" name="start_at" type="datetime-local" required className="text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="end_at" className="text-xs">Tamat</Label>
                                <Input id="end_at" name="end_at" type="datetime-local" className="text-sm" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="location" className="text-xs">Lokasi</Label>
                            <Input id="location" name="location" className="text-sm" />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="max_participants" className="text-xs">Had Peserta (pilihan)</Label>
                            <Input id="max_participants" name="max_participants" type="number" min={1} className="text-sm" />
                        </div>

                        {/* Tags */}
                        <div className="space-y-1.5">
                            <Label className="text-xs">Tag</Label>
                            <div className="flex flex-wrap gap-1.5">
                                {EVENT_TAGS.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
                                        className="cursor-pointer text-xs"
                                        onClick={() => toggleTag(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Publish toggle */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <input
                                type="checkbox"
                                id="publish"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                className="h-4 w-4 accent-primary"
                            />
                            <Label htmlFor="publish" className="text-xs cursor-pointer">
                                Terbitkan program ini (visible to public)
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
