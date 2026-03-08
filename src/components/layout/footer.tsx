/**
 * Footer — KrackedDevs promo for Ramadan Challenge #RC26.
 * Visible without login, placed in root layout.
 */

import Image from 'next/image';

export function Footer() {
    return (
        <footer className="mt-8 mb-20 lg:mb-4">
            <div className="glass-card rounded-2xl p-4 text-center space-y-2">
                {/* KrackedDevs Branding */}
                <div className="flex items-center justify-center gap-2">
                    <Image
                        src="/bg/krackeddevs-logo.jpg"
                        alt="KrackedDevs Logo"
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-lg object-contain shadow-sm"
                    />
                    <span className="font-semibold text-sm">KrackedDevs</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    Aplikasi ini dibina sebagai sebahagian daripada <strong>Ramadan Challenge #RC26</strong> oleh KrackedDevs
                    — cabaran pembangunan ICT sepanjang Ramadan untuk manfaat komuniti.
                </p>

                <div className="flex items-center justify-center gap-3 text-[10px]">
                    <a
                        href="https://krackeddevs.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary dark:text-primary hover:underline font-medium"
                    >
                        Sertai Kami
                    </a>
                    <span className="text-muted-foreground">•</span>
                    <a
                        href="https://krackeddevs.com/refer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary dark:text-primary hover:underline font-medium"
                    >
                        Rujukan
                    </a>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-medium text-violet-600 dark:text-violet-400">#RC26</span>
                </div>
            </div>
        </footer>
    );
}
