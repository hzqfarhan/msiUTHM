'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { completeOnboarding } from '@/actions/onboarding';
import { toast } from 'sonner';

export default function OnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    const profile = useProfile();

    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'student' | 'staff' | 'alumni' | 'community' | ''>('');
    const [faculty, setFaculty] = useState('');
    const [batch, setBatch] = useState('');
    const [phone, setPhone] = useState('');

    // Checkboxes for volunteering
    const [volunteering, setVolunteering] = useState<Record<string, boolean>>({
        events: false,
        cleaning: false,
        teaching: false,
        media: false,
    });

    useEffect(() => {
        if (profile) {
            if (profile.onboarding_completed) {
                router.replace(redirect);
            }
            if (profile.full_name) {
                setFullName(profile.full_name);
            }
        }
    }, [profile, router, redirect]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) {
            toast.error('Sila pilih peranan anda.');
            return;
        }

        setLoading(true);

        const activeInterests = Object.keys(volunteering).filter(k => volunteering[k]);

        const result = await completeOnboarding({
            full_name: fullName,
            community_role: role as any,
            faculty: faculty || undefined,
            batch: batch || undefined,
            phone: phone || undefined,
            volunteering_interests: activeInterests,
        });

        if (result.error) {
            toast.error(result.error);
            setLoading(false);
        } else {
            toast.success('Profil berjaya dilengkapkan!');
            router.push(redirect);
            // Refresh to trigger re-rendering with new profile data
            router.refresh();
        }
    };

    const handleSkip = () => {
        toast.success('Melangkau buat masa ini.');
        router.push(redirect);
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Lengkapkan Profil Anda</h1>
                    <p className="text-sm text-muted-foreground">Bantu kami menyesuaikan pengalaman anda di aplikasi ini.</p>
                </div>

                <Card className="border-border/50 shadow-sm">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="full_name">Nama Penuh <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="full_name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Nama anda"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Peranan Komuniti <span className="text-destructive">*</span></Label>
                                    <Select value={role} onValueChange={(v: any) => setRole(v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih peranan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="student">Pelajar</SelectItem>
                                            <SelectItem value="staff">Staf</SelectItem>
                                            <SelectItem value="alumni">Alumni</SelectItem>
                                            <SelectItem value="community">Komuniti / Orang Awam</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {(role === 'student' || role === 'alumni') && (
                                    <>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="faculty">Fakulti (Pilihan)</Label>
                                            <Input
                                                id="faculty"
                                                value={faculty}
                                                onChange={(e) => setFaculty(e.target.value)}
                                                placeholder="Contoh: FSKTM"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="batch">Tahun / Batch (Pilihan)</Label>
                                            <Input
                                                id="batch"
                                                value={batch}
                                                onChange={(e) => setBatch(e.target.value)}
                                                placeholder="Contoh: 2024"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="space-y-1.5">
                                    <Label htmlFor="phone">Nombor Telefon (Pilihan)</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="012-3456789"
                                    />
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label className="text-base font-semibold">Minat Kesukarelawanan (Pilihan)</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="vol-events"
                                                checked={volunteering.events}
                                                onChange={(e) => setVolunteering({ ...volunteering, events: e.target.checked })}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <label htmlFor="vol-events" className="text-sm font-medium leading-none cursor-pointer">Menjayakan Acara</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="vol-cleaning"
                                                checked={volunteering.cleaning}
                                                onChange={(e) => setVolunteering({ ...volunteering, cleaning: e.target.checked })}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <label htmlFor="vol-cleaning" className="text-sm font-medium leading-none cursor-pointer">Pembersihan</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="vol-teaching"
                                                checked={volunteering.teaching}
                                                onChange={(e) => setVolunteering({ ...volunteering, teaching: e.target.checked })}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <label htmlFor="vol-teaching" className="text-sm font-medium leading-none cursor-pointer">Mengajar / Mentor</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="vol-media"
                                                checked={volunteering.media}
                                                onChange={(e) => setVolunteering({ ...volunteering, media: e.target.checked })}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <label htmlFor="vol-media" className="text-sm font-medium leading-none cursor-pointer">Media & Fotografi</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? 'Menyimpan...' : 'Simpan Profil'}
                                </Button>
                                <Button type="button" variant="ghost" onClick={handleSkip} disabled={loading} className="w-full text-muted-foreground">
                                    Langkau buat masa ini
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
