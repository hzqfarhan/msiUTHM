'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, User, AlertCircle, Loader2, Lock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import type { CommunityChatMessage } from '@/lib/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface EmbellishedMessage extends CommunityChatMessage {
    isOptimistic?: boolean;
    profiles?: {
        full_name: string | null;
        role: string | null;
        avatar_url: string | null;
    } | null;
}

function RoleBadge({ role }: { role: string | null | undefined }) {
    if (!role) return null;
    switch (role) {
        case 'admin':
            return <Badge variant="default" className="text-[9px] px-1 h-3.5 bg-red-500 hover:bg-red-600 text-white border-0">Admin</Badge>;
        case 'moderator':
            return <Badge variant="secondary" className="text-[9px] px-1 h-3.5 bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">Mod</Badge>;
        case 'staff':
            return <Badge variant="outline" className="text-[9px] px-1 h-3.5 border-blue-200 text-blue-600 bg-blue-50/50">Staf</Badge>;
        case 'member':
            return <Badge variant="outline" className="text-[9px] px-1 h-3.5 border-emerald-200 text-emerald-600 bg-emerald-50/50">Kariah</Badge>;
        case 'student':
            return <Badge variant="outline" className="text-[9px] px-1 h-3.5 text-muted-foreground bg-muted/50 border-muted">Pelajar</Badge>;
        default:
            return null;
    }
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
                // Fetch last 50 messages with their profile info
                const { data, error: fetchErr } = await supabase
                    .from('community_chat_messages')
                    .select('*, profiles(full_name, role, avatar_url)')
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
                            return [...prev, { ...newMessage }];
                        });

                        // Fetch the profile for this new message if not ours
                        if (newMessage.user_id !== profile.id) {
                            const { data: userData } = await supabase
                                .from('profiles')
                                .select('full_name, role, avatar_url')
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
            profiles: { full_name: profile.full_name, role: profile.role, avatar_url: profile.avatar_url }
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

    const deleteMessage = async (id: string, isYourOwn: boolean) => {
        if (!confirm(isYourOwn ? 'Adakah anda pasti mahu memadam mesej ini?' : 'MODERATOR: Padam mesej ini?')) return;

        // Optimistically remove from UI
        setMessages(prev => prev.filter(m => m.id !== id));

        try {
            const { error } = await supabase
                .from('community_chat_messages')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            } else {
                toast.success('Mesej dipadam');
            }
        } catch (err) {
            console.error('Gagal memadam mesej:', err);
            toast.error('Gagal memadam mesej. Anda tiada kebenaran.');
            // Note: If you wanted a robust rollback, you would store the deleted message temporarily and inject it back.
            // For MVP, relying on Realtime or user refresh is fine as it will error silently and they will see it didn't disappear if they reopen.
        }
    };

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
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background/50">
            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-1 sm:px-4 py-3 space-y-4 scrollbar-hide"
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
                        const isAdminOrMod = profile.role === 'admin' || profile.role === 'moderator';
                        const canDelete = isMe || isAdminOrMod;
                        const name = isMe ? 'Anda' : (msg.profiles?.full_name || 'Ahli Komuniti');
                        const initials = name.substring(0, 2).toUpperCase();

                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    'flex gap-2 group',
                                    isMe ? 'flex-row-reverse' : 'flex-row',
                                    msg.isOptimistic && 'opacity-70'
                                )}
                            >
                                <Avatar className="h-7 w-7 border border-[var(--glass-border)] shrink-0 mt-1">
                                    <AvatarImage src={msg.profiles?.avatar_url || ''} />
                                    <AvatarFallback className="text-[10px] bg-primary/10 text-navy dark:text-primary font-medium">{initials}</AvatarFallback>
                                </Avatar>

                                <div className={cn('flex flex-col gap-1 max-w-[80%]', isMe ? 'items-end' : 'items-start')}>
                                    <div className={cn('flex items-center gap-1.5 px-1 flex-wrap', isMe && 'flex-row-reverse')}>
                                        <span className="text-[11px] font-medium text-foreground">{name}</span>
                                        {!isMe && <RoleBadge role={msg.profiles?.role} />}
                                        <span className="text-[9px] text-muted-foreground/50 whitespace-nowrap">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <div className={cn('relative flex items-center gap-1.5', isMe && 'flex-row-reverse')}>
                                        <div
                                            className={cn(
                                                'rounded-2xl px-3 py-2 text-sm leading-relaxed',
                                                isMe
                                                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                                    : 'glass-card border border-[var(--glass-border)] rounded-tl-sm',
                                            )}
                                        >
                                            <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                        </div>

                                        {canDelete && (
                                            <button
                                                onClick={() => deleteMessage(msg.id, isMe)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full shrink-0"
                                                title={isMe ? "Padam mesej anda" : "Tindakan Moderator: Padam"}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
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
                        className="flex-1 h-10 rounded-xl glass-input px-3.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
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
