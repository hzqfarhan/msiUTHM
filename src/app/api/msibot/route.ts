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
    // --- Env validation ---
    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_API_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.AI_MODEL || 'gpt-3.5-turbo';

    if (!apiKey) {
        console.warn('[MSIBOT] AI_API_KEY not configured. Using fallback response.');
        return NextResponse.json({
            reply: 'Sila masukkan kunci API (`AI_API_KEY`) di fail `.env.local` untuk membolehkan saya berfungsi sepenuhnya. Buat masa ini, saya berada dalam mod luar talian (offline).'
        });
    }

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

    // Limit conversation history to last 10 messages to control token usage
    const recentMessages = userMessages.slice(-10);

    // --- Build messages array with system prompt ---
    const messages: ChatMessage[] = [
        { role: 'system', content: MSIBOT_SYSTEM_PROMPT },
        ...recentMessages,
    ];

    // --- Call LLM API ---
    try {
        const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.7,
                max_tokens: 500,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error('[MSIBOT] LLM API error:', response.status, errorText);

            if (response.status === 401) {
                return NextResponse.json(
                    { error: 'Ralat Pengesahan: Kunci API (AI_API_KEY) tidak sah. Sila semak di Vercel.' },
                    { status: 401 }
                );
            }
            if (response.status === 429) {
                return NextResponse.json(
                    { error: 'Had atau Kuota API telah tamat. Sila semak baki OpenAI/Provider anda.' },
                    { status: 429 }
                );
            }

            return NextResponse.json(
                { error: 'Maaf, MSIBOT sedang menghadapi masalah teknikal. Sila cuba semula.' },
                { status: 502 }
            );
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat menjana jawapan.';

        return NextResponse.json({ reply });
    } catch (err) {
        console.error('[MSIBOT] Error:', err instanceof Error ? err.message : err);
        return NextResponse.json(
            { error: 'Maaf, MSIBOT tidak dapat dihubungi. Sila cuba semula.' },
            { status: 500 }
        );
    }
}
