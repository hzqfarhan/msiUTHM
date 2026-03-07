/**
 * Zod validators for feedback forms.
 */
import { z } from 'zod';
import { FEEDBACK_CATEGORIES, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/constants';

const categoryValues = FEEDBACK_CATEGORIES.map((c) => c.value) as [string, ...string[]];

export const feedbackSchema = z.object({
    category: z.enum(categoryValues, {
        error: 'Sila pilih kategori',
    }),
    description: z
        .string()
        .min(10, 'Penerangan mesti sekurang-kurangnya 10 huruf')
        .max(1000, 'Penerangan terlalu panjang'),
    facility_id: z.string().uuid().optional().nullable(),
});

const imageTypes = ALLOWED_IMAGE_TYPES as [string, ...string[]];

export const feedbackImageSchema = z.object({
    size: z.number().max(MAX_FILE_SIZE, 'Saiz fail melebihi 5MB'),
    type: z.enum(imageTypes, {
        error: 'Hanya imej JPEG, PNG, WebP dan GIF dibenarkan',
    }),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
