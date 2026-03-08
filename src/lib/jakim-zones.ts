/**
 * Maps geographical coordinates to the nearest JAKIM prayer time zone.
 * Malaysia has 52 zones across states. We map lat/lng to the closest one.
 * 
 * Source: JAKIM e-Solat zone list
 */

export interface JakimZone {
    code: string;
    name: string;
    state: string;
    lat: number;
    lng: number;
}

// Representative coordinates for each JAKIM zone (major zones only)
const JAKIM_ZONES: JakimZone[] = [
    // Johor
    { code: 'JHR01', name: 'Pulau Aur dan Pemanggil', state: 'Johor', lat: 2.45, lng: 104.52 },
    { code: 'JHR02', name: 'Kota Tinggi, Mersing, Johor Bahru', state: 'Johor', lat: 1.73, lng: 103.89 },
    { code: 'JHR03', name: 'Kluang, Pontian', state: 'Johor', lat: 2.03, lng: 103.32 },
    { code: 'JHR04', name: 'Batu Pahat, Muar, Segamat, Gemas', state: 'Johor', lat: 1.85, lng: 102.93 },
    // Kedah
    { code: 'KDH01', name: 'Pokok Sena, Kuala Nerang', state: 'Kedah', lat: 6.21, lng: 100.54 },
    { code: 'KDH02', name: 'Gunung Jerai', state: 'Kedah', lat: 5.79, lng: 100.43 },
    { code: 'KDH03', name: 'Sungai Petani, Kuala Muda', state: 'Kedah', lat: 5.65, lng: 100.49 },
    { code: 'KDH04', name: 'Baling', state: 'Kedah', lat: 5.67, lng: 100.92 },
    { code: 'KDH05', name: 'Kulim, Bandar Baharu', state: 'Kedah', lat: 5.37, lng: 100.56 },
    { code: 'KDH06', name: 'Langkawi', state: 'Kedah', lat: 6.35, lng: 99.80 },
    { code: 'KDH07', name: 'Alor Setar, Jitra', state: 'Kedah', lat: 6.12, lng: 100.37 },
    // Kelantan
    { code: 'KTN01', name: 'Kota Bharu, Bachok, Pasir Puteh', state: 'Kelantan', lat: 6.13, lng: 102.24 },
    { code: 'KTN03', name: 'Gua Musang', state: 'Kelantan', lat: 4.88, lng: 101.97 },
    // Melaka
    { code: 'MLK01', name: 'Melaka', state: 'Melaka', lat: 2.19, lng: 102.25 },
    // Negeri Sembilan
    { code: 'NGS01', name: 'Tampin, Jempol', state: 'N. Sembilan', lat: 2.47, lng: 102.23 },
    { code: 'NGS02', name: 'Seremban, Kuala Pilah, Jelebu, Rembau', state: 'N. Sembilan', lat: 2.73, lng: 101.94 },
    // Pahang
    { code: 'PHG01', name: 'Pulau Tioman', state: 'Pahang', lat: 2.81, lng: 104.16 },
    { code: 'PHG02', name: 'Kuantan, Pekan, Rompin, Muadzam Shah', state: 'Pahang', lat: 3.81, lng: 103.33 },
    { code: 'PHG03', name: 'Jerantut, Temerloh, Maran, Bera, Chenor', state: 'Pahang', lat: 3.94, lng: 102.36 },
    { code: 'PHG04', name: 'Bentong, Raub', state: 'Pahang', lat: 3.52, lng: 101.91 },
    { code: 'PHG05', name: 'Cameron Highlands, Genting', state: 'Pahang', lat: 4.47, lng: 101.38 },
    // Perak
    { code: 'PRK01', name: 'Tapah, Slim River, Tanjung Malim', state: 'Perak', lat: 3.93, lng: 101.40 },
    { code: 'PRK02', name: 'Ipoh, Batu Gajah, Kampar', state: 'Perak', lat: 4.60, lng: 101.08 },
    { code: 'PRK03', name: 'Lenggong, Pengkalan Hulu', state: 'Perak', lat: 5.11, lng: 100.97 },
    { code: 'PRK04', name: 'Taiping, Kuala Kangsar', state: 'Perak', lat: 4.85, lng: 100.73 },
    { code: 'PRK05', name: 'Teluk Intan, Bagan Datuk', state: 'Perak', lat: 4.03, lng: 101.02 },
    { code: 'PRK06', name: 'Manjung, Lumut, Sitiawan', state: 'Perak', lat: 4.19, lng: 100.66 },
    { code: 'PRK07', name: 'Gerik', state: 'Perak', lat: 5.45, lng: 101.13 },
    // Perlis
    { code: 'PLS01', name: 'Perlis', state: 'Perlis', lat: 6.44, lng: 100.20 },
    // Pulau Pinang
    { code: 'PNG01', name: 'Pulau Pinang', state: 'P. Pinang', lat: 5.42, lng: 100.33 },
    // Sabah
    { code: 'SBH01', name: 'Kota Kinabalu, Penampang', state: 'Sabah', lat: 5.98, lng: 116.07 },
    { code: 'SBH02', name: 'Sandakan, Beluran, Kinabatangan', state: 'Sabah', lat: 5.84, lng: 118.06 },
    { code: 'SBH03', name: 'Tawau, Semporna, Lahad Datu', state: 'Sabah', lat: 4.24, lng: 117.89 },
    // Sarawak
    { code: 'SWK01', name: 'Kuching, Lundu, Samarahan', state: 'Sarawak', lat: 1.55, lng: 110.34 },
    { code: 'SWK02', name: 'Sri Aman, Betong, Lubok Antu', state: 'Sarawak', lat: 1.24, lng: 111.46 },
    { code: 'SWK03', name: 'Sibu, Mukah, Kanowit', state: 'Sarawak', lat: 2.30, lng: 111.83 },
    { code: 'SWK04', name: 'Miri, Limbang, Lawas', state: 'Sarawak', lat: 4.40, lng: 114.01 },
    { code: 'SWK05', name: 'Bintulu', state: 'Sarawak', lat: 3.17, lng: 113.04 },
    // Selangor
    { code: 'SGR01', name: 'Gombak, Petaling, Sepang, Hulu Langat, Shah Alam', state: 'Selangor', lat: 3.07, lng: 101.59 },
    { code: 'SGR02', name: 'Kuala Selangor, Sabak Bernam', state: 'Selangor', lat: 3.35, lng: 101.26 },
    { code: 'SGR03', name: 'Hulu Selangor, Rawang', state: 'Selangor', lat: 3.49, lng: 101.58 },
    // Terengganu
    { code: 'TRG01', name: 'Kuala Terengganu, Marang, Kuala Nerus', state: 'Terengganu', lat: 5.31, lng: 103.13 },
    { code: 'TRG02', name: 'Kemaman, Dungun', state: 'Terengganu', lat: 4.23, lng: 103.42 },
    { code: 'TRG03', name: 'Besut, Setiu', state: 'Terengganu', lat: 5.63, lng: 102.59 },
    { code: 'TRG04', name: 'Hulu Terengganu', state: 'Terengganu', lat: 5.05, lng: 102.85 },
    // WP
    { code: 'WLY01', name: 'Kuala Lumpur, Putrajaya', state: 'WP KL', lat: 3.14, lng: 101.69 },
    { code: 'WLY02', name: 'Labuan', state: 'WP Labuan', lat: 5.28, lng: 115.24 },
];

/**
 * Find the nearest JAKIM zone given lat/lng coordinates.
 * Uses simple Euclidean distance (good enough for Malaysia's scale).
 */
export function findNearestZone(lat: number, lng: number): JakimZone {
    let nearest = JAKIM_ZONES[0];
    let minDist = Infinity;

    for (const zone of JAKIM_ZONES) {
        const dist = Math.pow(zone.lat - lat, 2) + Math.pow(zone.lng - lng, 2);
        if (dist < minDist) {
            minDist = dist;
            nearest = zone;
        }
    }

    return nearest;
}

/**
 * Map a timezone string to a default JAKIM zone code.
 * Used as fallback when geolocation is denied.
 */
export function timezoneToZone(tz: string): string {
    const mapping: Record<string, string> = {
        'Asia/Kuala_Lumpur': 'JHR04',  // Default to MSI UTHM zone
        'Asia/Singapore': 'JHR02',
        'Asia/Kuching': 'SWK01',
        'Asia/Brunei': 'SBH01',
        'Asia/Manila': 'JHR04',        // Fallback
        'Asia/Jakarta': 'JHR04',       // Fallback
    };
    return mapping[tz] || 'JHR04'; // Default: MSI UTHM Batu Pahat
}

export { JAKIM_ZONES };
