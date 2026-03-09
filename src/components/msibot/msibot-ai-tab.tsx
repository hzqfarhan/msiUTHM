'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Send, User, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const FIXED_RESPONSES: Record<string, string> = {
    'Apakah rukun iman?': 'Rukun Iman ada enam perkara asas: 1. Beriman kepada Allah. 2. Beriman kepada Malaikat. 3. Beriman kepada Kitab-kitab. 4. Beriman kepada Rasul-rasul. 5. Beriman kepada Hari Kiamat. 6. Beriman kepada Qada dan Qadar.',
    'Kelebihan selawat': 'Kelebihan selawat sangat besar. Antaranya: Allah SWT akan berselawat (menurunkan rahmat) 10 kali kepada mereka yang berselawat, dihapuskan dosa, diangkat darjat, dan mendapat syafaat Rasulullah SAW di Hari Kiamat kelak.',
    'Doa dipermudahkan urusan': 'Doa yang afdal untuk memohon dipermudahkan urusan: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي" (Rabbish rahli sadri, wa yassirli amri, wahlul uqdatam min lisani, yafqahu qauli).',
    'Cara solat sunat Dhuha': 'Solat sunat Dhuha dilakukan antara 2 hingga 8 rakaat. Waktunya bermula kira-kira 20 minit selepas waktu Syuruk sehinggalah hampir masuk waktu Zohor. Sunat membaca Surah As-Syams pada rakaat pertama dan Surah Ad-Dhuha pada rakaat kedua selepas Al-Fatihah.',
};

interface Props {
    open: boolean;
}

export function MsibotAiTab({ open }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Focus input when panel opens
    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [open]);

    const sendMessage = useCallback(async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMsg: Message = { role: 'user', content: text };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setError(null);
        setLoading(true);

        // Check for fixed hardcoded responses to save API usage
        if (FIXED_RESPONSES[text]) {
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', content: FIXED_RESPONSES[text] }]);
                setLoading(false);
            }, 600); // simulated natural delay
            return;
        }

        try {
            const res = await fetch('/api/msibot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Ralat tidak diketahui.');
                setLoading(false);
                return;
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch {
            setError('Tidak dapat menghubungi MSIBOT. Sila semak sambungan internet anda.');
        } finally {
            setLoading(false);
        }
    }, [input, loading, messages]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full bg-background/50">
            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide"
            >
                {/* Welcome message */}
                {messages.length === 0 && !loading && (
                    <div className="text-center py-8 space-y-3">
                        <div className="relative h-20 w-20 mx-auto drop-shadow-lg">
                            <Image
                                src="/msibot/chibi-msi.png"
                                alt="MSIBOT"
                                fill
                                className="object-contain"
                                sizes="80px"
                            />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Assalamualaikum! 👋</p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[260px] mx-auto">
                                Saya MSIBOT, rakan AI anda.
                                Tanya saya apa sahaja kemusykilan agama atau info berkaitan masjid!
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                            {[
                                'Apakah rukun iman?',
                                'Kelebihan selawat',
                                'Doa dipermudahkan urusan',
                                'Cara solat sunat Dhuha',
                            ].map(q => (
                                <button
                                    key={q}
                                    onClick={() => { setInput(q); setTimeout(sendMessage, 50); }}
                                    className="text-[10px] px-2.5 py-1.5 rounded-full glass-button text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message bubbles */}
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={cn(
                            'flex gap-2',
                            msg.role === 'user' ? 'justify-end' : 'justify-start',
                        )}
                    >
                        {msg.role === 'assistant' && (
                            <div className="relative h-6 w-6 rounded-full overflow-hidden bg-primary/10 shrink-0 mt-0.5">
                                <Image
                                    src="/msibot/msi-head.png"
                                    alt="MSIBOT"
                                    fill
                                    className="object-contain"
                                    sizes="24px"
                                />
                            </div>
                        )}
                        <div
                            className={cn(
                                'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                                msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-br-md'
                                    : 'glass-card rounded-bl-md',
                            )}
                        >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === 'user' && (
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                <User className="h-3 w-3" />
                            </div>
                        )}
                    </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                    <div className="flex gap-2 items-start">
                        <div className="relative h-6 w-6 rounded-full overflow-hidden bg-primary/10 shrink-0 mt-0.5">
                            <Image
                                src="/msibot/msi-head.png"
                                alt="MSIBOT"
                                fill
                                className="object-contain"
                                sizes="24px"
                            />
                        </div>
                        <div className="glass-card rounded-2xl rounded-bl-md px-3.5 py-2.5">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Sedang memikirkan...</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-[var(--glass-border-subtle)] px-3 py-3 bg-card/50">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tanya MSIBOT..."
                        className="flex-1 h-10 rounded-xl glass-input px-3.5 text-sm placeholder:text-muted-foreground/50"
                        disabled={loading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className={cn(
                            'h-10 w-10 rounded-xl flex items-center justify-center transition-all shrink-0',
                            input.trim() && !loading
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'bg-muted text-muted-foreground cursor-not-allowed',
                        )}
                        aria-label="Hantar mesej"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
                <p className="text-[9px] text-muted-foreground text-center mt-1.5">
                    MSIBOT mungkin memberi maklumat yang kurang tepat. Semak fakta penting.
                </p>
            </div>
        </div>
    );
}
