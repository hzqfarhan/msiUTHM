/**
 * MSIBOT Chat Panel — full chat UI in a slide-up drawer.
 * Loads lazily via dynamic import from the FAB component.
 */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, MessageSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import our new extracted tab components
import { MsibotAiTab } from './msibot-ai-tab';
import { CommunityChatTab } from './community-chat-tab';

interface Props {
    open: boolean;
    onClose: () => void;
}

export function MsibotChat({ open, onClose }: Props) {
    const [activeTab, setActiveTab] = useState<'ai' | 'community'>('ai');

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm transition-opacity duration-300',
                    open ? 'opacity-100' : 'opacity-0 pointer-events-none',
                )}
                onClick={onClose}
            />

            {/* Chat panel */}
            <div
                className={cn(
                    'fixed z-[90] transition-all duration-300 ease-out flex flex-col',
                    // Mobile: full-width bottom sheet
                    'bottom-0 left-0 right-0 h-[85vh]',
                    // Desktop: side panel at bottom-right
                    'sm:bottom-4 sm:right-4 sm:left-auto sm:w-[450px] sm:h-[650px] sm:rounded-2xl',
                    'rounded-t-2xl sm:rounded-2xl',
                    'glass-heavy border border-[var(--glass-border)] bg-background/95',
                    open
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-full opacity-0 pointer-events-none',
                )}
            >
                {/* Header with Title and Close */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border-subtle)] shrink-0 bg-card/50">
                    <div className="flex items-center gap-2.5">
                        <div className="relative h-9 w-9 rounded-full overflow-hidden bg-primary/10 border border-primary/20">
                            <Image
                                src="/msibot/msi-head.png"
                                alt="MSIBOT"
                                fill
                                className="object-contain"
                                sizes="36px"
                            />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">MSI Companion</h3>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                Sentiasa Bersedia
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Tutup chat"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Tabs Structure */}
                <Tabs
                    defaultValue="ai"
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as any)}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    <div className="px-4 py-2 border-b border-[var(--glass-border-subtle)] shrink-0 bg-muted/20">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="ai" className="flex items-center gap-2 text-xs">
                                <MessageSquare className="h-3.5 w-3.5" />
                                MSIBOT
                            </TabsTrigger>
                            <TabsTrigger value="community" className="flex items-center gap-2 text-xs">
                                <Users className="h-3.5 w-3.5" />
                                Komuniti
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 relative overflow-hidden bg-background">
                        {/* Tab Contents - Using absolute positioning to keep them mounted but hidden for instant switching */}
                        <div className={cn("absolute inset-0 transition-opacity", activeTab === 'ai' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none')}>
                            <MsibotAiTab open={open && activeTab === 'ai'} />
                        </div>

                        <div className={cn("absolute inset-0 transition-opacity", activeTab === 'community' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none')}>
                            {/* We only render community chat after first mount to save initial load, 
                                but once mounted we keep it to preserve websocket connection */}
                            <CommunityChatTab />
                        </div>
                    </div>
                </Tabs>
            </div>
        </>
    );
}
