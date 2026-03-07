/**
 * Lightweight analytics event logger.
 * Non-invasive: uses anonymous session_id from localStorage.
 * Logs events to Supabase analytics_events table.
 */
'use client';

import { createClient } from '@/lib/supabase/client';
import { getSessionId } from '@/lib/utils';

interface TrackEventOptions {
    page_path?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Track an analytics event. Fire-and-forget (no await needed in UI).
 */
export function trackEvent(eventName: string, options: TrackEventOptions = {}) {
    // Don't track server-side
    if (typeof window === 'undefined') return;

    const supabase = createClient();
    const sessionId = getSessionId();

    supabase
        .from('analytics_events')
        .insert({
            event_name: eventName,
            session_id: sessionId,
            page_path: options.page_path || window.location.pathname,
            metadata: options.metadata || null,
        })
        .then(({ error }) => {
            if (error) console.warn('[Analytics] Track error:', error.message);
        });
}

/**
 * Track a page view.
 */
export function trackPageView(path?: string) {
    trackEvent('page_view', { page_path: path });
}

/**
 * Track PWA install prompt shown / accepted.
 */
export function trackInstallPrompt(action: 'shown' | 'accepted' | 'dismissed') {
    trackEvent('pwa_install', { metadata: { action } });
}

/**
 * Track RSVP action.
 */
export function trackRsvp(eventId: string, action: 'created' | 'cancelled') {
    trackEvent('rsvp', { metadata: { event_id: eventId, action } });
}

/**
 * Track share action.
 */
export function trackShare(contentType: string, contentId: string) {
    trackEvent('share', { metadata: { content_type: contentType, content_id: contentId } });
}

/**
 * Track QR code scan (triggered when ?src=qr_* param is detected).
 */
export function trackQrScan(src: string) {
    trackEvent('qr_scan', { metadata: { src } });
}

/**
 * Track feedback submission.
 */
export function trackFeedbackSubmit(category?: string) {
    trackEvent('feedback_submit', { metadata: { category } });
}
