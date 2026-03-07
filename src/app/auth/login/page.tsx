/**
 * Login page — magic link + Google OAuth.
 */
'use client';

import { useState } from 'react';
import { signInWithMagicLink, signInWithGoogle } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    const errorParam = searchParams.get('error');

    const handleMagicLink = async (formData: FormData) => {
        setLoading(true);
        formData.append('redirect', redirect);
        try {
            const result = await signInWithMagicLink(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                setEmailSent(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        await signInWithGoogle(redirect);
    };

    if (emailSent) {
        return (
            <Card className="border-border/50">
                <CardContent className="p-6 text-center space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h2 className="font-semibold">Semak E-mel Anda</h2>
                    <p className="text-sm text-muted-foreground">
                        Kami telah menghantar link log masuk ke e-mel anda. Klik link tersebut untuk meneruskan.
                    </p>
                    <Button variant="link" size="sm" onClick={() => setEmailSent(false)}>
                        Hantar semula
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
                {errorParam && (
                    <p className="text-sm text-destructive text-center">
                        {errorParam === 'auth_failed' ? 'Log masuk gagal. Sila cuba lagi.' : 'Link tidak sah.'}
                    </p>
                )}

                <form action={handleMagicLink} className="space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-medium">E-mel</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="nama@contoh.com"
                            required
                            autoComplete="email"
                            className="text-sm"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <Mail className="mr-2 h-4 w-4" />
                        {loading ? 'Menghantar...' : 'Log Masuk dengan E-mel'}
                    </Button>
                </form>

                <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                        atau
                    </span>
                </div>

                <form action={handleGoogle}>
                    <Button type="submit" variant="outline" className="w-full">
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Log Masuk dengan Google
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="space-y-4 max-w-sm mx-auto pt-8">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
                <Link href="/">
                    <ArrowLeft className="mr-1 h-3 w-3" /> Kembali
                </Link>
            </Button>

            <div className="text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg">
                    M
                </div>
                <h1 className="text-xl font-bold">Log Masuk</h1>
                <p className="text-sm text-muted-foreground">MSI UTHM Companion</p>
            </div>

            <Suspense fallback={<div className="h-48" />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
