/**
 * Prayer times API route — allows client-side zone detection.
 * GET /api/prayer-times?zone=JHR04&date=2026-03-08
 * GET /api/prayer-times?lat=1.85&lng=102.93
 */
import { NextRequest, NextResponse } from 'next/server';
import { jakimProvider } from '@/services/prayer-times';
import { findNearestZone } from '@/lib/jakim-zones';
import { getTodayDateString } from '@/lib/utils';
import { JAKIM_ZONE_CODE } from '@/lib/constants';

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const date = params.get('date') || getTodayDateString();

    let zoneCode = params.get('zone') || JAKIM_ZONE_CODE;
    let zoneName = '';

    // If lat/lng provided, find nearest zone
    const lat = params.get('lat');
    const lng = params.get('lng');
    if (lat && lng) {
        const zone = findNearestZone(parseFloat(lat), parseFloat(lng));
        zoneCode = zone.code;
        zoneName = zone.name;
    }

    const times = await jakimProvider.fetchTimes(date, zoneCode);
    if (!times) {
        return NextResponse.json(
            { error: 'Tidak dapat mendapatkan waktu solat', zone: zoneCode },
            { status: 502 }
        );
    }

    return NextResponse.json({
        ...times,
        zone: zoneCode,
        zoneName,
        source: 'jakim-api',
    }, {
        headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
    });
}
