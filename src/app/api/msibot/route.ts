/**
 * MSIBOT API Route — proxies chat to an OpenAI-compatible LLM endpoint.
 * Reads AI credentials from server-side env vars only (never exposed to client).
 * 
 * POST /api/msibot
 * Body: { messages: [{ role: 'user'|'assistant', content: string }] }
 */
import { NextRequest, NextResponse } from 'next/server';
import { MSIBOT_SYSTEM_PROMPT } from '@/lib/msibot-prompt';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// Simple in-memory rate limiting (per IP, 20 requests/minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
        return true;
    }
    if (entry.count >= RATE_LIMIT) return false;
    entry.count++;
    return true;
}

export async function POST(request: NextRequest) {
    // API Key is now hardcoded for Muslim AI Agent

    // --- Rate limiting ---
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: 'Terlalu banyak permintaan. Sila tunggu sebentar.' },
            { status: 429 }
        );
    }

    // --- Parse body ---
    let body: { messages?: ChatMessage[] };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Format permintaan tidak sah.' }, { status: 400 });
    }

    const userMessages = body.messages;
    if (!userMessages || !Array.isArray(userMessages) || userMessages.length === 0) {
        return NextResponse.json({ error: 'Tiada mesej diberikan.' }, { status: 400 });
    }

    // --- Call Muslim AI Agent API ---
    try {
        const lastUserMessage = userMessages.filter(m => m.role === 'user').pop();
        const query = lastUserMessage?.content || '';

        if (!query) {
            return NextResponse.json({ reply: 'Sila hantar soalan anda.' });
        }

        const endpoint = `https://x.0cd.fun/ai/agent/muslim-ai?query=${encodeURIComponent(query)}&language=ms`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'x-api-key': '0cd-b5df99832b42af16e3313b4845759a5e95fc9da16a39e1ee',
            },
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error('[MSIBOT] LLM API error:', response.status, errorText);

            if (response.status === 401 || response.status === 403) {
                return NextResponse.json(
                    { error: 'Ralat Pengesahan: Kunci API Muslim AI tidak sah.' },
                    { status: response.status }
                );
            }
            if (response.status === 429) {
                return NextResponse.json(
                    { error: 'Had atau Kuota API Muslim AI telah tamat.' },
                    { status: 429 }
                );
            }

            return NextResponse.json(
                { error: 'Maaf, MSIBOT sedang menghadapi masalah teknikal. Sila cuba semula.' },
                { status: 502 }
            );
        }

        const data = await response.json();

        // The API returns { answer: "..." }
        const reply = data.answer || 'Maaf, saya tidak dapat menjana jawapan buat masa ini.';

        return NextResponse.json({ reply });
    } catch (err) {
        console.error('[MSIBOT] Error:', err instanceof Error ? err.message : err);
        return NextResponse.json(
            { error: 'Maaf, MSIBOT tidak dapat dihubungi. Sila cuba semula.' },
            { status: 500 }
        );
    }
}
