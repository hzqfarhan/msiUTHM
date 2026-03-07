/**
 * Qibla Direction Page — modern liquid glass compass with SVG rings and glowing needle.
 * Uses browser geolocation + device orientation.
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Compass, MapPin, AlertTriangle, RotateCw } from 'lucide-react';

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

type Status = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported';

function computeQibla(lat: number, lng: number): number {
    const φ1 = (lat * Math.PI) / 180;
    const φ2 = (KAABA_LAT * Math.PI) / 180;
    const Δλ = ((KAABA_LNG - lng) * Math.PI) / 180;
    const x = Math.sin(Δλ);
    const y = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
    let bearing = (Math.atan2(x, y) * 180) / Math.PI;
    return (bearing + 360) % 360;
}

export default function QiblaPage() {
    const [status, setStatus] = useState<Status>('idle');
    const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
    const [compassHeading, setCompassHeading] = useState<number>(0);
    const [hasOrientation, setHasOrientation] = useState(false);
    const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

    const requestPermissions = useCallback(async () => {
        setStatus('requesting');

        if (!navigator.geolocation) {
            setStatus('unsupported');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setUserCoords({ lat: latitude, lng: longitude });
                const angle = computeQibla(latitude, longitude);
                setQiblaAngle(angle);
                setStatus('granted');
            },
            () => setStatus('denied'),
            { enableHighAccuracy: true, timeout: 10000 },
        );

        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const response = await (DeviceOrientationEvent as any).requestPermission();
                if (response !== 'granted') return;
            } catch {
                // Ignore
            }
        }
    }, []);

    useEffect(() => {
        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.alpha !== null) {
                const heading = (e as any).webkitCompassHeading ?? (360 - (e.alpha || 0));
                setCompassHeading(heading);
                setHasOrientation(true);
            }
        };

        window.addEventListener('deviceorientation', handleOrientation, true);
        return () => window.removeEventListener('deviceorientation', handleOrientation, true);
    }, []);

    const needleRotation = qiblaAngle !== null ? qiblaAngle - compassHeading : 0;
    const compassSize = 280;
    const center = compassSize / 2;
    const outerR = center - 8;
    const innerR = center - 28;
    const tickR = center - 12;

    // Generate tick marks
    const ticks = Array.from({ length: 72 }, (_, i) => {
        const angle = (i * 5 * Math.PI) / 180;
        const isMajor = i % 18 === 0; // every 90°
        const isMinor = i % 6 === 0; // every 30°
        const len = isMajor ? 14 : isMinor ? 9 : 4;
        const r1 = tickR;
        const r2 = tickR - len;
        return {
            x1: center + r1 * Math.sin(angle),
            y1: center - r1 * Math.cos(angle),
            x2: center + r2 * Math.sin(angle),
            y2: center - r2 * Math.cos(angle),
            isMajor,
            isMinor,
        };
    });

    const cardinalLabels = [
        { label: 'U', angle: 0, color: '#ef4444' },
        { label: 'T', angle: 90, color: '#94a3b8' },
        { label: 'S', angle: 180, color: '#94a3b8' },
        { label: 'B', angle: 270, color: '#94a3b8' },
    ];

    // Bearing degree numbers (every 30°, skip cardinals)
    const bearingNumbers = [30, 60, 120, 150, 210, 240, 300, 330];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold">Arah Kiblat</h1>
                <p className="text-sm text-muted-foreground">Cari arah kiblat dari lokasi anda</p>
            </div>

            <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-6">
                {status === 'idle' && (
                    <div className="text-center space-y-4">
                        <div className="mx-auto rounded-full liquid-btn liquid-btn-emerald p-6 w-fit">
                            <Compass className="h-12 w-12 text-emerald-400" />
                        </div>
                        <p className="text-sm text-muted-foreground max-w-[280px]">
                            Kami perlukan akses lokasi dan kompas peranti anda untuk menentukan arah kiblat.
                        </p>
                        <button onClick={requestPermissions} className="liquid-btn liquid-btn-emerald">
                            <MapPin className="h-4 w-4" /> Benarkan Akses
                        </button>
                    </div>
                )}

                {status === 'requesting' && (
                    <div className="text-center space-y-3 py-8">
                        <RotateCw className="h-8 w-8 animate-spin text-emerald-500 mx-auto" />
                        <p className="text-sm text-muted-foreground">Mendapatkan lokasi...</p>
                    </div>
                )}

                {status === 'denied' && (
                    <div className="text-center space-y-3 py-4">
                        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                        <p className="text-sm text-muted-foreground">
                            Akses lokasi ditolak. Sila benarkan akses lokasi dalam tetapan pelayar.
                        </p>
                        <button onClick={requestPermissions} className="liquid-btn liquid-btn-gold text-xs">
                            Cuba Semula
                        </button>
                    </div>
                )}

                {status === 'unsupported' && (
                    <div className="text-center space-y-3 py-4">
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
                        <p className="text-sm text-muted-foreground">
                            Pelayar anda tidak menyokong geolokasi.
                        </p>
                    </div>
                )}

                {status === 'granted' && qiblaAngle !== null && (
                    <>
                        {/* Modern SVG Compass */}
                        <div className="relative" style={{ width: compassSize, height: compassSize }}>
                            {/* Glass background circle */}
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
                                    border: '2px solid rgba(255,255,255,0.08)',
                                    boxShadow: '0 0 40px rgba(16,185,129,0.15), inset 0 0 60px rgba(16,185,129,0.05)',
                                }}
                            />

                            <svg
                                width={compassSize}
                                height={compassSize}
                                viewBox={`0 0 ${compassSize} ${compassSize}`}
                                className="absolute inset-0"
                            >
                                <defs>
                                    {/* Glow filter */}
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                    <filter id="strongGlow">
                                        <feGaussianBlur stdDeviation="6" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                    {/* Needle gradient */}
                                    <linearGradient id="needleGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
                                    </linearGradient>
                                </defs>

                                {/* Outer ring */}
                                <circle cx={center} cy={center} r={outerR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                                {/* Inner ring */}
                                <circle cx={center} cy={center} r={innerR} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                                {/* Rotating compass rose with ticks and labels */}
                                <g transform={`rotate(${-compassHeading}, ${center}, ${center})`} style={{ transition: 'transform 0.3s ease-out' }}>
                                    {/* Tick marks */}
                                    {ticks.map((t, i) => (
                                        <line
                                            key={i}
                                            x1={t.x1} y1={t.y1}
                                            x2={t.x2} y2={t.y2}
                                            stroke={t.isMajor ? 'rgba(255,255,255,0.5)' : t.isMinor ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'}
                                            strokeWidth={t.isMajor ? 2 : 1}
                                        />
                                    ))}

                                    {/* Cardinal labels */}
                                    {cardinalLabels.map((c) => {
                                        const rad = (c.angle * Math.PI) / 180;
                                        const labelR = innerR - 16;
                                        const x = center + labelR * Math.sin(rad);
                                        const y = center - labelR * Math.cos(rad);
                                        return (
                                            <text
                                                key={c.label}
                                                x={x} y={y}
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                fill={c.color}
                                                fontSize="14"
                                                fontWeight="700"
                                                fontFamily="inherit"
                                            >
                                                {c.label}
                                            </text>
                                        );
                                    })}

                                    {/* Bearing degree numbers */}
                                    {bearingNumbers.map((deg) => {
                                        const rad = (deg * Math.PI) / 180;
                                        const numR = innerR - 16;
                                        const x = center + numR * Math.sin(rad);
                                        const y = center - numR * Math.cos(rad);
                                        return (
                                            <text
                                                key={deg}
                                                x={x} y={y}
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                fill="rgba(148,163,184,0.85)"
                                                fontSize="10"
                                                fontWeight="500"
                                                fontFamily="inherit"
                                            >
                                                {deg}
                                            </text>
                                        );
                                    })}
                                </g>

                                {/* Qibla Needle */}
                                <g
                                    transform={`rotate(${needleRotation}, ${center}, ${center})`}
                                    style={{ transition: hasOrientation ? 'transform 0.3s ease-out' : 'none' }}
                                    filter="url(#strongGlow)"
                                >
                                    {/* Needle body */}
                                    <polygon
                                        points={`${center},${center - innerR + 20} ${center - 6},${center} ${center + 6},${center}`}
                                        fill="url(#needleGrad)"
                                        opacity="0.9"
                                    />
                                    {/* Needle tip glow */}
                                    <circle cx={center} cy={center - innerR + 20} r="5" fill="#10b981" opacity="0.8" />
                                    {/* Kaaba icon at tip */}
                                    <rect
                                        x={center - 4} y={center - innerR + 16}
                                        width="8" height="8"
                                        rx="1"
                                        fill="#000"
                                        stroke="#10b981"
                                        strokeWidth="1"
                                    />
                                </g>

                                {/* Center dot */}
                                <circle cx={center} cy={center} r="5" fill="#10b981" filter="url(#glow)" />
                                <circle cx={center} cy={center} r="2" fill="#fff" opacity="0.8" />
                            </svg>
                        </div>

                        {/* Bearing readout */}
                        <div className="text-center space-y-2">
                            <div className="liquid-btn liquid-btn-emerald px-6 py-2 inline-flex items-center gap-2">
                                <span className="text-2xl font-bold text-emerald-400 tabular-nums">
                                    {Math.round(qiblaAngle)}°
                                </span>
                                <span className="text-xs text-muted-foreground">dari Utara</span>
                            </div>
                            {!hasOrientation && (
                                <p className="text-xs text-amber-500 liquid-btn liquid-btn-gold px-3 py-1 text-[10px]">
                                    ⚠ Kompas tidak disokong — arah manual
                                </p>
                            )}
                            {userCoords && (
                                <p className="text-[10px] text-muted-foreground">
                                    📍 {userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Info card */}
            <div className="glass-card rounded-2xl p-4">
                <h3 className="text-sm font-medium mb-1">ℹ️ Nota</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Arah kiblat dikira dari koordinat GPS anda ke Kaabah di Makkah al-Mukarramah.
                    Untuk ketepatan kompas, pastikan telefon anda dikalibrasi (gerakkan dalam bentuk &lsquo;8&rsquo;).
                    Arah kiblat di Malaysia umumnya kira-kira 292° dari Utara.
                </p>
            </div>
        </div>
    );
}
