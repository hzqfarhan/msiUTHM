/**
 * Zod validators for announcement forms.
 */
import { z } from 'zod';

export const createAnnouncementSchema = z.object({
    title: z.string().min(3, 'Tajuk mesti sekurang-kurangnya 3 huruf').max(200),
    body: z.string().max(5000).optional(),
    category: z.enum(['general', 'urgent', 'event', 'facilities']).default('general'),
    is_published: z.boolean().default(true),
    pinned: z.boolean().default(false),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
