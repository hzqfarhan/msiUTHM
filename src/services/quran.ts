/**
 * Quran API service layer — wraps AlQuran Cloud API.
 * Modular and replaceable: swap BASE_URL / editions to change provider.
 */

const BASE_URL = 'https://api.alquran.cloud/v1';

/* ── Edition identifiers (easy to swap later) ── */
const EDITIONS = {
    arabic: 'quran-uthmani',
    english: 'en.asad',
    malay: 'ms.basmeih',
    audio: 'ar.alafasy', // Mishary Rashid Alafasy
} as const;

/* ── Types ── */
export interface SurahMeta {
    number: number;
    name: string;           // Arabic
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string; // Meccan / Medinan
}

export interface Ayah {
    number: number;          // global ayah number
    numberInSurah: number;
    text: string;
    audio?: string;
    juz: number;
    surah?: SurahMeta;       // populated in juz responses
}

export interface SurahEdition {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
    ayahs: Ayah[];
}

export interface JuzEdition {
    number: number;
    ayahs: Ayah[];
}

export interface JuzMeta {
    id: number;
    name: string;
    startingSurah: string;
}

export interface QuranApiResult<T> {
    ok: boolean;
    data?: T;
    error?: string;
}

/* ── In-memory cache ── */
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function cachedFetch<T>(url: string): Promise<QuranApiResult<T>> {
    const now = Date.now();
    const hit = cache.get(url);
    if (hit && now - hit.ts < CACHE_TTL) {
        return { ok: true, data: hit.data as T };
    }

    try {
        const res = await fetch(url);
        if (!res.ok) {
            return { ok: false, error: `API error: ${res.status} ${res.statusText}` };
        }
        const json = await res.json();
        if (json.code !== 200) {
            return { ok: false, error: json.status || 'Unknown API error' };
        }
        cache.set(url, { data: json.data, ts: now });
        return { ok: true, data: json.data as T };
    } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
    }
}

/* ── Public API ── */

/** Fetch metadata for all 114 surahs */
export async function getSurahList(): Promise<QuranApiResult<SurahMeta[]>> {
    return cachedFetch<SurahMeta[]>(`${BASE_URL}/surah`);
}

/** Fetch full surah text for a given edition */
export async function getSurahDetail(
    surahNumber: number,
    edition: string,
): Promise<QuranApiResult<SurahEdition>> {
    return cachedFetch<SurahEdition>(`${BASE_URL}/surah/${surahNumber}/${edition}`);
}

/** Convenience: Arabic text */
export function getSurahArabic(n: number) {
    return getSurahDetail(n, EDITIONS.arabic);
}

/** Convenience: English translation */
export function getSurahEnglish(n: number) {
    return getSurahDetail(n, EDITIONS.english);
}

/** Convenience: Malay translation */
export function getSurahMalay(n: number) {
    return getSurahDetail(n, EDITIONS.malay);
}

/** Fetch full juz text for a given edition */
export async function getJuzDetail(
    juzNumber: number,
    edition: string,
): Promise<QuranApiResult<JuzEdition>> {
    return cachedFetch<JuzEdition>(`${BASE_URL}/juz/${juzNumber}/${edition}`);
}

export function getJuzArabic(n: number) {
    return getJuzDetail(n, EDITIONS.arabic);
}

export function getJuzEnglish(n: number) {
    return getJuzDetail(n, EDITIONS.english);
}

export function getJuzMalay(n: number) {
    return getJuzDetail(n, EDITIONS.malay);
}

/** Convenience: Arabic text with audio */
export function getSurahAudio(n: number) {
    return getSurahDetail(n, EDITIONS.audio);
}

/** Full surah audio URL (AlAfasy reciter) */
export function getFullSurahAudioUrl(surahNumber: number): string {
    return `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`;
}

/** Per-ayah audio URL */
export function getAyahAudioUrl(globalAyahNumber: number): string {
    return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNumber}.mp3`;
}

/** 30 Juz Metadata for Layouts */
export const JUZ_METADATA: JuzMeta[] = [
    { id: 1, name: 'Juz 1', startingSurah: 'Al-Fatihah' },
    { id: 2, name: 'Juz 2', startingSurah: 'Al-Baqarah' },
    { id: 3, name: 'Juz 3', startingSurah: 'Al-Baqarah' },
    { id: 4, name: 'Juz 4', startingSurah: 'Ali \'Imran' },
    { id: 5, name: 'Juz 5', startingSurah: 'An-Nisa\'' },
    { id: 6, name: 'Juz 6', startingSurah: 'An-Nisa\'' },
    { id: 7, name: 'Juz 7', startingSurah: 'Al-Ma\'idah' },
    { id: 8, name: 'Juz 8', startingSurah: 'Al-An\'am' },
    { id: 9, name: 'Juz 9', startingSurah: 'Al-A\'raf' },
    { id: 10, name: 'Juz 10', startingSurah: 'Al-Anfal' },
    { id: 11, name: 'Juz 11', startingSurah: 'At-Taubah' },
    { id: 12, name: 'Juz 12', startingSurah: 'Hud' },
    { id: 13, name: 'Juz 13', startingSurah: 'Yusuf' },
    { id: 14, name: 'Juz 14', startingSurah: 'Al-Hijr' },
    { id: 15, name: 'Juz 15', startingSurah: 'Al-Isra\'' },
    { id: 16, name: 'Juz 16', startingSurah: 'Al-Kahf' },
    { id: 17, name: 'Juz 17', startingSurah: 'Al-Anbiya\'' },
    { id: 18, name: 'Juz 18', startingSurah: 'Al-Mu\'minun' },
    { id: 19, name: 'Juz 19', startingSurah: 'Al-Furqan' },
    { id: 20, name: 'Juz 20', startingSurah: 'An-Naml' },
    { id: 21, name: 'Juz 21', startingSurah: 'Al-\'Ankabut' },
    { id: 22, name: 'Juz 22', startingSurah: 'Al-Ahzab' },
    { id: 23, name: 'Juz 23', startingSurah: 'Yasin' },
    { id: 24, name: 'Juz 24', startingSurah: 'Az-Zumar' },
    { id: 25, name: 'Juz 25', startingSurah: 'Fussilat' },
    { id: 26, name: 'Juz 26', startingSurah: 'Al-Ahqaf' },
    { id: 27, name: 'Juz 27', startingSurah: 'Az-Zariyat' },
    { id: 28, name: 'Juz 28', startingSurah: 'Al-Mujadilah' },
    { id: 29, name: 'Juz 29', startingSurah: 'Al-Mulk' },
    { id: 30, name: 'Juz 30', startingSurah: 'An-Naba\'' },
];

/** Surah revelation (Nuzul) order mapping (SurahNumber: RevelationOrder) */
export const SURAH_REVELATION_ORDER: Record<number, number> = {
    1: 5, 2: 87, 3: 89, 4: 92, 5: 112, 6: 55, 7: 39, 8: 88, 9: 113, 10: 51,
    11: 52, 12: 53, 13: 96, 14: 72, 15: 54, 16: 70, 17: 50, 18: 69, 19: 44, 20: 45,
    21: 73, 22: 103, 23: 74, 24: 102, 25: 42, 26: 47, 27: 48, 28: 49, 29: 85, 30: 84,
    31: 57, 32: 75, 33: 90, 34: 58, 35: 43, 36: 41, 37: 56, 38: 38, 39: 59, 40: 60,
    41: 61, 42: 62, 43: 63, 44: 64, 45: 65, 46: 66, 47: 95, 48: 111, 49: 106, 50: 34,
    51: 67, 52: 76, 53: 23, 54: 37, 55: 97, 56: 46, 57: 94, 58: 105, 59: 101, 60: 91,
    61: 109, 62: 110, 63: 104, 64: 108, 65: 99, 66: 107, 67: 77, 68: 2, 69: 78, 70: 79,
    71: 71, 72: 40, 73: 3, 74: 4, 75: 31, 76: 98, 77: 33, 78: 80, 79: 81, 80: 24,
    81: 7, 82: 82, 83: 86, 84: 83, 85: 27, 86: 36, 87: 8, 88: 68, 89: 10, 90: 35,
    91: 26, 92: 9, 93: 11, 94: 12, 95: 28, 96: 1, 97: 25, 98: 100, 99: 93, 100: 14,
    101: 30, 102: 16, 103: 13, 104: 32, 105: 19, 106: 29, 107: 17, 108: 15, 109: 18, 110: 114,
    111: 6, 112: 22, 113: 20, 114: 21
};

/** Malay surah names (sourced from common references) */
export const MALAY_SURAH_NAMES: Record<number, string> = {
    1: 'Al-Fatihah',
    2: 'Al-Baqarah',
    3: 'Ali \'Imran',
    4: 'An-Nisa\'',
    5: 'Al-Ma\'idah',
    6: 'Al-An\'am',
    7: 'Al-A\'raf',
    8: 'Al-Anfal',
    9: 'At-Taubah',
    10: 'Yunus',
    11: 'Hud',
    12: 'Yusuf',
    13: 'Ar-Ra\'d',
    14: 'Ibrahim',
    15: 'Al-Hijr',
    16: 'An-Nahl',
    17: 'Al-Isra\'',
    18: 'Al-Kahf',
    19: 'Maryam',
    20: 'Taha',
    21: 'Al-Anbiya\'',
    22: 'Al-Hajj',
    23: 'Al-Mu\'minun',
    24: 'An-Nur',
    25: 'Al-Furqan',
    26: 'Asy-Syu\'ara\'',
    27: 'An-Naml',
    28: 'Al-Qasas',
    29: 'Al-\'Ankabut',
    30: 'Ar-Rum',
    31: 'Luqman',
    32: 'As-Sajdah',
    33: 'Al-Ahzab',
    34: 'Saba\'',
    35: 'Fatir',
    36: 'Yasin',
    37: 'As-Saffat',
    38: 'Sad',
    39: 'Az-Zumar',
    40: 'Ghafir',
    41: 'Fussilat',
    42: 'Asy-Syura',
    43: 'Az-Zukhruf',
    44: 'Ad-Dukhan',
    45: 'Al-Jasiyah',
    46: 'Al-Ahqaf',
    47: 'Muhammad',
    48: 'Al-Fath',
    49: 'Al-Hujurat',
    50: 'Qaf',
    51: 'Az-Zariyat',
    52: 'At-Tur',
    53: 'An-Najm',
    54: 'Al-Qamar',
    55: 'Ar-Rahman',
    56: 'Al-Waqi\'ah',
    57: 'Al-Hadid',
    58: 'Al-Mujadalah',
    59: 'Al-Hasyr',
    60: 'Al-Mumtahanah',
    61: 'As-Saff',
    62: 'Al-Jumu\'ah',
    63: 'Al-Munafiqun',
    64: 'At-Taghabun',
    65: 'At-Talaq',
    66: 'At-Tahrim',
    67: 'Al-Mulk',
    68: 'Al-Qalam',
    69: 'Al-Haqqah',
    70: 'Al-Ma\'arij',
    71: 'Nuh',
    72: 'Al-Jin',
    73: 'Al-Muzzammil',
    74: 'Al-Muddassir',
    75: 'Al-Qiyamah',
    76: 'Al-Insan',
    77: 'Al-Mursalat',
    78: 'An-Naba\'',
    79: 'An-Nazi\'at',
    80: '\'Abasa',
    81: 'At-Takwir',
    82: 'Al-Infitar',
    83: 'Al-Mutaffifin',
    84: 'Al-Insyiqaq',
    85: 'Al-Buruj',
    86: 'At-Tariq',
    87: 'Al-A\'la',
    88: 'Al-Ghasyiyah',
    89: 'Al-Fajr',
    90: 'Al-Balad',
    91: 'Asy-Syams',
    92: 'Al-Lail',
    93: 'Ad-Duha',
    94: 'Al-Insyirah',
    95: 'At-Tin',
    96: 'Al-\'Alaq',
    97: 'Al-Qadr',
    98: 'Al-Bayyinah',
    99: 'Az-Zalzalah',
    100: 'Al-\'Adiyat',
    101: 'Al-Qari\'ah',
    102: 'At-Takasur',
    103: 'Al-\'Asr',
    104: 'Al-Humazah',
    105: 'Al-Fil',
    106: 'Quraisy',
    107: 'Al-Ma\'un',
    108: 'Al-Kausar',
    109: 'Al-Kafirun',
    110: 'An-Nasr',
    111: 'Al-Lahab',
    112: 'Al-Ikhlas',
    113: 'Al-Falaq',
    114: 'An-Nas',
};

/** Malay surah meanings (translations) */
export const MALAY_SURAH_MEANINGS: Record<number, string> = {
    1: 'Pembukaan',
    2: 'Sapi Betina / Lembu Betina',
    3: 'Keluarga Imran',
    4: 'Wanita',
    5: 'Hidangan',
    6: 'Binatang Ternak',
    7: 'Tempat Tertinggi',
    8: 'Harta Rampasan Perang',
    9: 'Taubat',
    10: 'Yunus',
    11: 'Hud',
    12: 'Yusuf',
    13: 'Guruh',
    14: 'Ibrahim',
    15: 'Gunung Batu',
    16: 'Lebah',
    17: 'Perjalanan Malam',
    18: 'Gua',
    19: 'Maryam',
    20: 'Ta-Ha',
    21: 'Para Nabi',
    22: 'Haji',
    23: 'Golongan yang Beriman',
    24: 'Cahaya',
    25: 'Pemisah',
    26: 'Para Penyair',
    27: 'Semut',
    28: 'Kisah',
    29: 'Labah-labah',
    30: 'Rom',
    31: 'Luqman',
    32: 'Sujud',
    33: 'Golongan yang Bersekutu',
    34: 'Saba\'',
    35: 'Pencipta',
    36: 'Yasin',
    37: 'Golongan yang Bersaf-saf',
    38: 'Sad',
    39: 'Rombongan',
    40: 'Yang Mengampuni',
    41: 'Dijelaskan',
    42: 'Mesyuarat',
    43: 'Perhiasan Emas',
    44: 'Asap',
    45: 'Yang Berlutut',
    46: 'Bukit Pasir',
    47: 'Muhammad',
    48: 'Kemenangan',
    49: 'Bilik-bilik',
    50: 'Qaf',
    51: 'Angin yang Menerbangkan',
    52: 'Gunung',
    53: 'Bintang',
    54: 'Bulan',
    55: 'Maha Pemurah',
    56: 'Peristiwa Berlakunya Kiamat',
    57: 'Besi',
    58: 'Gugatan',
    59: 'Pengusiran',
    60: 'Wanita yang Diuji',
    61: 'Saf',
    62: 'Hari Jumaat',
    63: 'Golongan Munafik',
    64: 'Saling Memperdaya',
    65: 'Cerai',
    66: 'Pengharaman',
    67: 'Kerajaan',
    68: 'Pena',
    69: 'Kenyataan',
    70: 'Tempat-tempat Naik',
    71: 'Nuh',
    72: 'Jin',
    73: 'Yang Berselimut',
    74: 'Yang Berkelubung',
    75: 'Kiamat',
    76: 'Manusia',
    77: 'Malaikat yang Diutus',
    78: 'Berita',
    79: 'Malaikat yang Mencabut',
    80: 'Bermasam Muka',
    81: 'Menggulung',
    82: 'Terbelah',
    83: 'Golongan yang Curang',
    84: 'Terkoyak',
    85: 'Gugusan Bintang',
    86: 'Pengunjung Malam',
    87: 'Yang Maha Tinggi',
    88: 'Peristiwa yang Menggelisahkan',
    89: 'Fajar',
    90: 'Negeri',
    91: 'Matahari',
    92: 'Malam',
    93: 'Pagi yang Cemerlang',
    94: 'Melapangkan',
    95: 'Buah Tin',
    96: 'Sebuku Darah',
    97: 'Kemuliaan',
    98: 'Bukti yang Nyata',
    99: 'Gegaran',
    100: 'Kuda yang Berlari Kencang',
    101: 'Hari Kiamat',
    102: 'Bermegah-megah',
    103: 'Masa',
    104: 'Pengumpat',
    105: 'Gajah',
    106: 'Quraisy',
    107: 'Barangan Berguna',
    108: 'Kebaikan yang Banyak',
    109: 'Golongan Kafir',
    110: 'Pertolongan',
    111: 'Nyalaan Api',
    112: 'Memurnikan Keesaan Allah',
    113: 'Kerikil / Subuh',
    114: 'Manusia',
};
