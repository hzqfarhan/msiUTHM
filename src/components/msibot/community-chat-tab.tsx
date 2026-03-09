'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, User, AlertCircle, Loader2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import type { CommunityChatMessage } from '@/lib/types/database';

interface EmbellishedMessage extends CommunityChatMessage {
    isOptimistic?: boolean;
    profiles?: {
        full_name: string | null;
        community_role: string | null;
    } | null;
}

export function CommunityChatTab() {
    const profile = useProfile();
    const supabase = createClient();

    const [messages, setMessages] = useState<EmbellishedMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Fetch initial messages and subscribe
    useEffect(() => {
        if (!profile) return;

        let channel: any;

        const loadMessages = async () => {
            try {
                // Fetch last 50 messages
                const { data, error: fetchErr } = await supabase
                    .from('community_chat_messages')
                    .select('*, profiles(full_name, community_role)')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (fetchErr) throw fetchErr;

                // Reverse to show chronologically (oldest top, newest bottom)
                setMessages(data?.reverse() || []);
            } catch (err) {
                console.error("Failed to load messages:", err);
                setError('Ralat memuat turun mesej komuniti.');
            } finally {
                setLoading(false);
            }
        };

        const subscribeToChanges = () => {
            channel = supabase
                .channel('community_chat_public')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'community_chat_messages' },
                    async (payload) => {
                        const newMessage = payload.new as CommunityChatMessage;

                        // Avoid duplicating if we optimistically added our own
                        setMessages(prev => {
                            if (prev.some(m => m.id === newMessage.id)) return prev;

                            // To get profile data for incoming message, we'd ideally fetch it, 
                            // but for MVP we might just refetch or display 'Seseorang'
                            // For simplicity, fetch the single user profile here quickly:
                            return [...prev, { ...newMessage }];
                        });

                        // Fetch the profile for this new message if not ours
                        if (newMessage.user_id !== profile.id) {
                            const { data: userData } = await supabase
                                .from('profiles')
                                .select('full_name, community_role')
                                .eq('id', newMessage.user_id)
                                .single();

                            if (userData) {
                                setMessages(prev => prev.map(m =>
                                    m.id === newMessage.id
                                        ? { ...m, profiles: userData }
                                        : m
                                ));
                            }
                        }
                    }
                )
                .on(
                    'postgres_changes',
                    { event: 'DELETE', schema: 'public', table: 'community_chat_messages' },
                    (payload) => {
                        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
                    }
                )
                .subscribe();
        };

        loadMessages().then(() => {
            subscribeToChanges();
        });

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [profile, supabase]);


    const sendMessage = useCallback(async () => {
        const text = input.trim();
        if (!text || sending || !profile) return;
        if (text.length > 500) {
            setError('Mesej terlalu panjang (Maksimum 500 patah perkataan).');
            return;
        }

        const tempId = crypto.randomUUID();
        const optimisticMsg: EmbellishedMessage = {
            id: tempId,
            user_id: profile.id,
            message: text,
            created_at: new Date().toISOString(),
            isOptimistic: true,
            profiles: { full_name: profile.full_name, community_role: profile.community_role || 'user' }
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setInput('');
        setError(null);
        setSending(true);

        try {
            const { data, error: insertErr } = await supabase
                .from('community_chat_messages')
                .insert({ user_id: profile.id, message: text })
                .select()
                .single();

            if (insertErr) throw insertErr;

            // Replace optimistic message with actual DB row
            setMessages(prev => prev.map(m => m.id === tempId ? { ...data, profiles: optimisticMsg.profiles } : m));
        } catch (err) {
            console.error("Send error:", err);
            // Remove optimistic message on fail
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setError('Gagal menghantar mesej.');
        } finally {
            setSending(false);
            // Refocus input
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [input, sending, profile, supabase]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!profile) {
        return (
            <div className="flex flex-col h-full bg-background/50 items-center justify-center p-6 text-center space-y-4">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold">Log Masuk Diperlukan</h3>
                    <p className="text-sm text-muted-foreground">Sila log masuk untuk menyertai ruang chat komuniti ini.</p>
                </div>
                {/* Notice: login CTA is handled by the wrapper or FAB, keeping this clean */}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background/50">
            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-hide"
            >
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                        <p className="text-sm font-medium">Belum ada perbualan</p>
                        <p className="text-xs text-muted-foreground">Jadilah orang pertama yang memulakan chat!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.user_id === profile.id;
                        const name = isMe ? 'Anda' : (msg.profiles?.full_name || 'Ahli Komuniti');

                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    'flex flex-col gap-1',
                                    isMe ? 'items-end' : 'items-start',
                                    msg.isOptimistic && 'opacity-70'
                                )}
                            >
                                <div className="flex items-baseline gap-2 px-1">
                                    <span className="text-[10px] font-medium text-muted-foreground">{name}</span>
                                    <span className="text-[9px] text-muted-foreground/50">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div
                                    className={cn(
                                        'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                                        isMe
                                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                                            : 'glass-card border border-[var(--glass-border)] rounded-bl-sm',
                                    )}
                                >
                                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                </div>
                            </div>
                        );
                    })
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
                        placeholder="Mesej komuniti..."
                        className="flex-1 h-10 rounded-xl glass-input px-3.5 text-sm placeholder:text-muted-foreground/50"
                        disabled={sending}
                        maxLength={500}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || sending}
                        className={cn(
                            'h-10 w-10 rounded-xl flex items-center justify-center transition-all shrink-0',
                            input.trim() && !sending
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'bg-muted text-muted-foreground cursor-not-allowed',
                        )}
                        aria-label="Hantar mesej"
                    >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
