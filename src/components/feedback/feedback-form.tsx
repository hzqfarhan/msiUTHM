/**
 * Feedback form — submit issue/feedback with category and photo.
 */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { submitFeedback } from '@/actions/feedback';
import { FEEDBACK_CATEGORIES } from '@/lib/constants';
import { toast } from 'sonner';
import { Send, Camera, CheckCircle } from 'lucide-react';

export function FeedbackForm() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            const result = await submitFeedback(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                setSubmitted(true);
                toast.success('Maklum balas dihantar! Terima kasih. 🙏');
            }
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <Card className="border-primary/30 dark:border-primary-dark/30">
                <CardContent className="p-8 text-center space-y-3">
                    <CheckCircle className="h-12 w-12 mx-auto text-primary" />
                    <h3 className="font-semibold">Terima Kasih!</h3>
                    <p className="text-sm text-muted-foreground">
                        Maklum balas anda telah diterima. Pihak masjid akan menyemaknya.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                        Hantar lagi
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50">
            <CardContent className="p-4">
                <form action={handleSubmit} className="space-y-4">
                    {/* Category */}
                    <div className="space-y-1.5">
                        <Label htmlFor="category" className="text-xs font-medium">Kategori</Label>
                        <Select name="category" required>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Pilih kategori..." />
                            </SelectTrigger>
                            <SelectContent>
                                {FEEDBACK_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-xs font-medium">Penerangan</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Terangkan isu atau maklum balas anda..."
                            required
                            minLength={10}
                            rows={4}
                            className="resize-none text-sm"
                        />
                    </div>

                    {/* Photo */}
                    <div className="space-y-1.5">
                        <Label htmlFor="photo" className="text-xs font-medium">
                            Gambar (pilihan)
                        </Label>
                        <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4 text-muted-foreground" />
                            <Input
                                id="photo"
                                name="photo"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="text-xs"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white"
                    >
                        <Send className="mr-2 h-4 w-4" />
                        {loading ? 'Menghantar...' : 'Hantar Maklum Balas'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
