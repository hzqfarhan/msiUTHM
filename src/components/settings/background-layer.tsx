/**
 * BackgroundLayer — renders static background images from public/ folder.
 * Uses separate images for light and dark mode.
 * 
 * To change the background:
 *   - Light mode: Replace /public/bg/bg-light.jpg
 *   - Dark mode:  Replace /public/bg/bg-dark.jpg
 *   - App logo:   Replace /public/bg/app-logo.png
 * 
 * These files are NOT user-accessible settings — developer-only via repo.
 */
'use client';

import { useEffect, useState } from 'react';

export function BackgroundLayer() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check initial dark mode
        setIsDark(document.documentElement.classList.contains('dark'));

        // Watch for class changes
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const bgSrc = isDark ? '/bg/bg-dark.png' : '/bg/bg-light.png';

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={bgSrc}
            alt=""
            aria-hidden="true"
            className="custom-bg-layer"
            onError={(e) => {
                // Hide if image doesn't exist yet
                (e.target as HTMLImageElement).style.display = 'none';
            }}
        />
    );
}
