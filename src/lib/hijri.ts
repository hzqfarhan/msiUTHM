/**
 * Hijri calendar date utilities using Intl.DateTimeFormat.
 * Uses the Islamic Umm al-Qura calendar (Saudi Arabia standard).
 */

const HIJRI_MONTHS_MS: Record<string, string> = {
    'Muharram': 'Muharam',
    'Safar': 'Safar',
    'Rabiʻ I': 'Rabiulawal',
    'Rabiʻ II': 'Rabiulakhir',
    'Jumada I': 'Jamadilawal',
    'Jumada II': 'Jamadilakhir',
    'Rajab': 'Rejab',
    'Shaʻban': 'Syaaban',
    'Ramadan': 'Ramadan',
    'Shawwal': 'Syawal',
    'Dhu al-Qaʿdah': 'Zulkaedah',
    'Dhu al-Hijjah': 'Zulhijjah',
};

/**
 * Get today's Hijri date formatted in Malay.
 * @returns e.g. "3 Ramadan 1447H"
 */
export function getHijriDate(date: Date = new Date()): string {
    try {
        const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        const parts = formatter.formatToParts(date);
        const day = parts.find(p => p.type === 'day')?.value || '';
        const monthEn = parts.find(p => p.type === 'month')?.value || '';
        const year = parts.find(p => p.type === 'year')?.value || '';

        // Translate month to Malay
        const monthMs = HIJRI_MONTHS_MS[monthEn] || monthEn;

        return `${day} ${monthMs} ${year}H`;
    } catch {
        return '';
    }
}

/**
 * Get short Hijri date (day + month only).
 * @returns e.g. "3 Ramadan"
 */
export function getHijriDateShort(date: Date = new Date()): string {
    try {
        const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'long',
        });

        const parts = formatter.formatToParts(date);
        const day = parts.find(p => p.type === 'day')?.value || '';
        const monthEn = parts.find(p => p.type === 'month')?.value || '';

        const monthMs = HIJRI_MONTHS_MS[monthEn] || monthEn;

        return `${day} ${monthMs}`;
    } catch {
        return '';
    }
}
