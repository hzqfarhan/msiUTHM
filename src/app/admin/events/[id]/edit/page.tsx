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
import { Save, ArrowLeft, Upload, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/client';

export default function AdminEventEditPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;
    const isNew = eventId === 'new';

    const [loading, setLoading] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isPublished, setIsPublished] = useState(false);
    const [posterUrl, setPosterUrl] = useState('');
    const [uploadingPoster, setUploadingPoster] = useState(false);
    const supabase = createClient();

    // Load existing event data
    useEffect(() => {
        if (!isNew) {
            getEventById(eventId).then(({ data }) => {
                if (data) {
                    setSelectedTags(data.tags || []);
                    setIsPublished(data.is_published);
                    setPosterUrl(data.poster_image_url || '');
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
        formData.set('poster_image_url', posterUrl);

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

    const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploadingPoster(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `event-posters/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setPosterUrl(data.publicUrl);
            toast.success('Poster berjaya dimuat naik!');
        } catch (err: any) {
            toast.error(`Gagal muat naik: ${err.message}`);
        } finally {
            setUploadingPoster(false);
        }
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

                        {/* Poster Image Upload */}
                        <div className="space-y-1.5">
                            <Label className="text-xs">Poster Acara (Opsional)</Label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePosterUpload}
                                    disabled={uploadingPoster}
                                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer disabled:opacity-50"
                                />
                                {uploadingPoster && <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />}
                            </div>
                            {posterUrl && (
                                <div className="relative mt-2 inline-block">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={posterUrl} alt="Poster Preview" className="w-40 h-auto rounded-xl border border-border/50" />
                                    <button type="button" onClick={() => setPosterUrl('')} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center text-xs hover:bg-destructive/80">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
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
