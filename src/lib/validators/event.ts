/**
 * Zod validators for event-related forms.
 */
import { z } from 'zod';

export const createEventSchema = z.object({
    title: z.string().min(3, 'Tajuk mesti sekurang-kurangnya 3 huruf').max(200),
    description: z.string().max(2000).optional(),
    start_at: z.string().min(1, 'Tarikh mula diperlukan'),
    end_at: z.string().optional(),
    location: z.string().max(200).optional(),
    tags: z.array(z.string()).default([]),
    is_published: z.boolean().default(false),
    max_participants: z.number().int().positive().optional().nullable(),
    poster_image_url: z.string().url().optional().nullable().or(z.literal('')).or(z.null()),
});

export const rsvpSchema = z.object({
    event_id: z.string().uuid(),
    guest_name: z.string().max(100).optional(),
    guest_phone: z.string().max(20).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
