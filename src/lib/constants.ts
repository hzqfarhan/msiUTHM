/**
 * App-wide constants.
 */

// MSI default mosque ID (matches seed data)
export const DEFAULT_MOSQUE_ID = process.env.NEXT_PUBLIC_MOSQUE_ID || '00000000-0000-0000-0000-000000000001';

// JAKIM zone code for Batu Pahat, Johor
export const JAKIM_ZONE_CODE = 'JHR01';

// Malaysia timezone
export const TIMEZONE = 'Asia/Kuala_Lumpur';

// Prayer names in display order
export const PRAYER_DISPLAY = [
    { key: 'subuh', label: 'Subuh', labelEn: 'Fajr' },
    { key: 'syuruk', label: 'Syuruk', labelEn: 'Sunrise' },
    { key: 'zohor', label: 'Zohor', labelEn: 'Dhuhr' },
    { key: 'asar', label: 'Asar', labelEn: 'Asr' },
    { key: 'maghrib', label: 'Maghrib', labelEn: 'Maghrib' },
    { key: 'isyak', label: 'Isyak', labelEn: 'Isha' },
] as const;

// Feedback categories
export const FEEDBACK_CATEGORIES = [
    { value: 'toilet', label: 'Tandas / Toilet' },
    { value: 'wudu', label: 'Tempat Wuduk / Wudu Area' },
    { value: 'speaker', label: 'Pembesar Suara / Speaker' },
    { value: 'aircond', label: 'Pendingin Hawa / Air-Cond' },
    { value: 'cleanliness', label: 'Kebersihan / Cleanliness' },
    { value: 'other', label: 'Lain-lain / Other' },
] as const;

// Event tags
export const EVENT_TAGS = [
    'Kelas', 'Iftar', 'Tarawih', 'Tazkirah', 'Sukarelawan', 'Khas', 'Ceramah', 'Gotong-Royong',
] as const;

// Announcement categories
export const ANNOUNCEMENT_CATEGORIES = [
    { value: 'general', label: 'Umum / General' },
    { value: 'urgent', label: 'Segera / Urgent' },
    { value: 'event', label: 'Acara / Event' },
    { value: 'facilities', label: 'Kemudahan / Facilities' },
] as const;

// Facility categories
export const FACILITY_CATEGORIES = [
    'Tandas / Toilet',
    'Tempat Wuduk / Wudu',
    'Dewan Solat / Prayer Hall',
    'Tempat Letak Kereta / Parking',
    'Ruang Rehat / Rest Area',
    'Akses OKU / Wheelchair Access',
] as const;

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
